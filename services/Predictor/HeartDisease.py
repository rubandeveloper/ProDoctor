from skimage.io import imread
from skimage import color
import matplotlib.pyplot as plt
from skimage.filters import threshold_otsu,gaussian
from skimage.transform import resize
from numpy import asarray
from skimage.metrics import structural_similarity
from skimage import measure
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
import joblib
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np
import os
from natsort import natsorted
from sklearn import linear_model, tree, ensemble
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
import base64
from PIL import Image


from Predictor.ECG import ECG

class HeartDisease:
	def __init__(self) -> None:

		self.ECG = ECG()

		self.DM_model = joblib.load('D:/Personals/Projects/ProDoctor/services/Models/PCA_ECG.pkl')
		self.predict_model = joblib.load('D:/Personals/Projects/ProDoctor/services/Models/Heart_Disease_Prediction_using_ECG.pkl')

	
	def predict(self, image):
		
		ecg_user_image_read = self.ECG.getImage(image)
		
		"""#### **GRAY SCALE IMAGE**"""
		ecg_user_gray_image_read = self.ECG.GrayImgae(ecg_user_image_read)
		
		"""#### **DIVIDING LEADS**"""
		dividing_leads=self.ECG.DividingLeads(ecg_user_image_read)	

		# st.image('Leads_1-12_figure.png')
    	# st.image('Long_Lead_13_figure.png')	
		
		"""#### **PREPROCESSED LEADS**"""
		ecg_preprocessed_leads = self.ECG.PreprocessingLeads(dividing_leads)
		
		# st.image('Preprossed_Leads_1-12_figure.png')
    	# st.image('Preprossed_Leads_13_figure.png')

		"""#### **EXTRACTING SIGNALS(1-12)**""" 
		ec_signal_extraction = self.ECG.SignalExtraction_Scaling(dividing_leads)
		
		# st.image('Contour_Leads_1-12_figure.png')

		"""#### **CONVERTING TO 1D SIGNAL**"""
		ecg_1dsignal = self.ECG.CombineConvert1Dsignal()

		"""#### **PERFORM DIMENSINALITY REDUCTION**"""
		ecg_final = self.ECG.DimensionalReduciton(ecg_1dsignal)

		"""#### **PASS TO PRETRAINED ML MODEL FOR PREDICTION**"""
		ecg_model= self.ECG.ModelLoad_predict(ecg_final)

		for i in range(1, 13):

			file_path = f"D:/Personals/Projects/ProDoctor/Scaled_1DLead_{i}.csv"

			if os.path.exists(file_path):
				os.remove(file_path)
				   

		processing_images = {
			"Leads_1_12": "Leads_1-12_figure.png",
			"Long_Lead_13": "Long_Lead_13_figure.png",
			"Preprossed_Leads_1-12": "Preprossed_Leads_1-12_figure.png",
			"Preprossed_Leads_13": "Preprossed_Leads_13_figure.png",
			"Contour_Leads_1-12": "Contour_Leads_1-12_figure.png",
		}


		for img in processing_images:
			
			file_name = processing_images[img]
			file_path = f"D:/Personals/Projects/ProDoctor/services/{file_name}"
			
			if not os.path.exists(file_path):
				continue
				
			image_data = ""
			with open(file_path, "rb") as image_file:
				image_data = image_file.read()
			
			processing_images[img] =  base64.b64encode(image_data).decode('utf-8')

			os.remove(file_path)
		
		return {
            "success": True,
            "message": ecg_model,
            "images": processing_images
        }

# heartDiseases = HeartDiseases()

# resul = heartDiseases.predict("D:/Personals/Projects/ProDoctor/services/heart_diseases/Dataset/History_of_MI/PMI(6).jpg")

# print(resul, 'resul')