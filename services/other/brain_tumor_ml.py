#Imports 
import os
import keras 
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from PIL import Image
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
plt.style.use('dark_background')
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder 


import tensorflow as tf
from tensorflow import keras
from matplotlib.pyplot import imshow

model = keras.models.load_model('D:/Personals/Projects/ProDoctor/services/brain_tumor_DLmodel.h5')

def names(number):
    if number==0:
        return 'Its a Tumor'
    else:
        return 'No, Its not a tumor'
    



img = Image.open(r"D:/Personals/Projects/ProDoctor/services/brain_tumor/no/N17.jpg")
x = np.array(img.resize((128,128)))

print(x.shape)

x = x.reshape(1,128,128,1)

res = model.predict_on_batch(x)
classification = np.where(res == np.amax(res))[1][0]

print(imshow(img))

print(str(res[0][classification]*100) + '% Confidence This Is ' + names(classification))