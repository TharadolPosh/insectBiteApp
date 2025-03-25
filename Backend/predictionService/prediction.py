import json
import cv2
import torch
from ultralytics import YOLO
from collections import defaultdict
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import shutil
import os

app = FastAPI()

# สร้างโฟลเดอร์สำหรับอัปโหลดและบันทึกผลลัพธ์ หากไม่มี
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# โหลดโมเดล YOLO
model = YOLO('model.pt')  # แก้ไข path ตามที่เหมาะสม

def calculate_average_confidence(predictions, results):
    """ คำนวณค่า confidence เฉลี่ยของแต่ละประเภทแมลง """
    confidence_sums = defaultdict(float)
    count = defaultdict(int)

    for pred in predictions:
        insect_type = results[0].names[int(pred.cls)]
        confidence_score = pred.conf.item()
        confidence_sums[insect_type] += confidence_score
        count[insect_type] += 1

    # หาค่าเฉลี่ยเฉพาะประเภทที่มีการตรวจพบ
    average_confidence = {insect: confidence_sums[insect] / count[insect] for insect in confidence_sums}
    return average_confidence

@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    try:
        # บันทึกไฟล์ที่อัปโหลด
        file_location = f"uploads/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # โหลดภาพและรันการพยากรณ์
        results = model(file_location)  
        image = cv2.imread(file_location)  

        # ตรวจสอบว่ามีการตรวจพบวัตถุหรือไม่
        if not results or not results[0].boxes:
            return JSONResponse(content={"message": "No objects detected", "data": []})

        predictions = results[0].boxes  # ดึงผลลัพธ์จากโมเดล
        prediction_data = []
        class_counts = defaultdict(int)

        for pred in predictions:
            insect_type = results[0].names[int(pred.cls)]
            confidence_score = pred.conf.item()
            box = pred.xyxy.tolist()[0]  

            # วาดกล่องและข้อความบนภาพ
            x_min, y_min, x_max, y_max = map(int, box)
            cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            cv2.putText(image, f"{insect_type} ({confidence_score:.2f})", 
                        (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                        0.5, (0, 255, 0), 2)

            # เก็บข้อมูลพยากรณ์
            prediction_data.append({
                'insect_type': insect_type,
                'confidence': confidence_score,
                'box': {
                    'x_min': x_min,
                    'y_min': y_min,
                    'x_max': x_max,
                    'y_max': y_max
                }
            })

            class_counts[insect_type] += 1

        # เวลาที่ใช้สำหรับการพยากรณ์
        inference_time = results[0].speed.get('inference', 0)
        prediction_data.append({'inference_time': inference_time})

        # คำนวณค่า confidence เฉลี่ย
        avg_confidences = calculate_average_confidence(predictions, results)
        prediction_data.append({'average_confidence': avg_confidences})

        # เก็บจำนวนคลาสที่ตรวจพบ
        prediction_data.append({'class_counts': class_counts})

        # บันทึกภาพพร้อมกล่อง
        output_image_path = f"outputs/{file.filename}"
        cv2.imwrite(output_image_path, image)

        # ลบไฟล์ต้นฉบับ (ถ้าต้องการ)
        os.remove(file_location)

        return JSONResponse(content={
            "message": "Prediction successful", 
            "data": prediction_data, 
            "image_url": output_image_path
        })
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# เรียกใช้ FastAPI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
