from PIL import Image
import numpy as np
import keras 
from matplotlib.pyplot import imshow


class BrainTumor(object):

    def __init__(self) -> None:

        self.model = keras.models.load_model('D:/Personals/Projects/ProDoctor/services/Models/brain_tumor_DLmodel.h5')
        
    
    def predict(self, image):

        def names(number):
            if number==0:
                return 'Its a Tumor'
            else:
                return 'No, Its not a tumor'
        
        img = Image.open(image)
        x = np.array(img.resize((128,128)))

        print(x.shape, (128,128,3), '/n')

        if x.shape != (128,128,3):
            return {
                "success": True,
                "message": "Invalid file size"
            }

        x = x.reshape(1,128,128,3)
        res = self.model.predict_on_batch(x)
        classification = np.where(res == np.amax(res))[1][0]


        print(classification, str(res[0][classification]*100) + '% Confidence This Is ' + names(classification))

        accuracy = str(res[0][classification]*100)
        hasDisesase = True if classification == 0 else False
        return {
            "success": True,
            "accuracy": accuracy,
            "message": names(classification),
            "hasDisesase": hasDisesase
        }