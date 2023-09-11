import os
from PIL import Image
import numpy as np
from matplotlib.pyplot import imshow
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.imagenet_utils import preprocess_input

class SkinDisease(object):

    def __init__(self) -> None:

        model_path = "../Models/skin_diseases_DLmodel_1.h5"
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), model_path))
        self.model = load_model(model_path)
        
    
    def predict(self, image):

        img = Image.open(image)
        x = np.array(img.resize((128,128)))
        x = x.reshape(1,128,128,3)
        
        result = self.model.predict(x)

        classification = np.where(result == np.amax(result))[1][0]

        accuracy = str(result[0][classification]*100)

        def names(number):
            if number==0:
                return 'actinic_keratosis'
            elif number==1:
                return 'basal_cell_carcinoma'
            elif number==2:
                return 'dermatofibroma'
            elif number==3:
                return 'melanoma'
            elif number==4:
                return 'nevus'
            else:
                return 'No, There is no diseases'
        

        diseases = names(classification)

        return {
            "success": True,
            "message": diseases,
            "accuracy":accuracy
        }


# skinDisease = SkinDisease()

# resul = skinDisease.predict("D:/Personals/Projects/ProDoctor/services/skin_diseases/Skin_Dataset/Test/basal_cell_carcinoma/ISIC_0024360.jpg")

# print(resul, 'resul')