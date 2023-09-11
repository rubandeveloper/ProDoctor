from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model
from matplotlib.pyplot import imshow
import os

class BrainTumor(object):

    def __init__(self) -> None:

        model_path = "../Models/brain_tumor_DLmodel.h5"
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), model_path))
        
        self.model = load_model(model_path)
        
    
    def predict(self, image):

        def names(number):
            if number==0:
                return 'Its a Tumor'
            else:
                return 'No, Its not a tumor'
        
        img = Image.open(image)
        x = np.array(img.resize((128,128)))

        if x.shape != (128,128,3):
            return {
                "success": True,
                "message": "Invalid file size"
            }

        x = x.reshape(1,128,128,3)
        res = self.model.predict_on_batch(x)
        classification = np.where(res == np.amax(res))[1][0]

        accuracy = str(res[0][classification]*100)
        hasDisesase = True if classification == 0 else False
        return {
            "success": True,
            "accuracy": accuracy,
            "message": names(classification),
            "hasDisesase": hasDisesase
        }