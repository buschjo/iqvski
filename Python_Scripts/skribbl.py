# imports
import os
import glob
import numpy as np

from tensorflow import keras
import tensorflow.keras.layers as layers
import tensorflow as tf

import matplotlib.pyplot as plt
from random import randint


# download the dataset
import urllib.request
def download():
    base = 'https://storage.googleapis.com/quickdraw_dataset/full/numpy_bitmap/'
    for c in classes:
        cls_url = c.replace('_', '%20')
        path = base+cls_url+'.npy'
        print(path)
        urllib.request.urlretrieve(path, 'c:/quickdraw_dataset/'+c+'.npy')


# load the data
def load_data(root, vfold_ratio=0.2, max_items_per_class=5000):
    all_files = glob.glob(os.path.join(root, '*.npy'))

    # initialize variables
    x = np.empty([0, 784])
    y = np.empty([0])
    class_names = []

    # load each data file
    for idx, file in enumerate(all_files):
        print("reading file: ", file)
        data = np.load(file)
        data = data[0: max_items_per_class, :]
        labels = np.full(data.shape[0], idx)

        x = np.concatenate((x, data), axis=0)
        y = np.append(y, labels)

        class_name, ext = os.path.splitext(os.path.basename(file))
        class_names.append(class_name)

    # randomize the dataset
    permutation = np.random.permutation(y.shape[0])
    x = x[permutation, :]
    y = y[permutation]

    # separate into training and testing
    vfold_size = int(x.shape[0] / 100 * (vfold_ratio * 100))

    x_test = x[0:vfold_size, :]
    y_test = y[0:vfold_size]

    x_train = x[vfold_size:x.shape[0], :]
    y_train = y[vfold_size:y.shape[0]]
    return x_train, y_train, x_test, y_test, class_names



# read class names
f = open("skribbl_classes.txt", "r")
classes = f.readlines()
f.close()

classes = [c.replace('\n', '').replace(' ', '_') for c in classes]

# # download the class files
# download()



# read in the data
x_train, y_train, x_test, y_test, class_names = load_data('c:/quickdraw_dataset')
num_classes = len(class_names)
image_size = 28

print(len(x_train))

idx = randint(0, len(x_train))
plt.imshow(x_train[idx].reshape(28, 28))
print(class_names[int(y_train[idx].item())])

# preprocess the data
# Reshape and normalize
x_train = x_train.reshape(x_train.shape[0], image_size, image_size, 1).astype('float32')
x_test = x_test.reshape(x_test.shape[0], image_size, image_size, 1).astype('float32')

x_train /= 255.0
x_test /= 255.0

# Convert class vectors to class matrices
y_train = keras.utils.to_categorical(y_train, num_classes)
y_test = keras.utils.to_categorical(y_test, num_classes)

# create the model
# Define model
model = keras.Sequential()
model.add(layers.Convolution2D(16, (3, 3),
                        padding='same',
                        input_shape=x_train.shape[1:], activation='relu'))
model.add(layers.MaxPooling2D(pool_size=(2, 2)))
model.add(layers.Convolution2D(32, (3, 3), padding='same', activation= 'relu'))
model.add(layers.MaxPooling2D(pool_size=(2, 2)))
model.add(layers.Convolution2D(64, (3, 3), padding='same', activation= 'relu'))
model.add(layers.MaxPooling2D(pool_size =(2,2)))
model.add(layers.Flatten())
model.add(layers.Dense(128, activation='relu'))
model.add(layers.Dense(100, activation='softmax'))
# Train model
adam = tf.train.AdamOptimizer()
model.compile(loss='categorical_crossentropy',
              optimizer=adam,
              metrics=['top_k_categorical_accuracy'])
print(model.summary())

# training
# fit the model
model.fit(x = x_train, y = y_train, validation_split=0.1, batch_size = 256, verbose=2, epochs=5)

# testing
# evaluate on unseen data
score = model.evaluate(x_test, y_test, verbose=0)
print('Test accuarcy: {:0.2f}%'.format(score[1] * 100))

# inference
idx = randint(0, len(x_test))
img = x_test[idx]
plt.imshow(img.squeeze())
pred = model.predict(np.expand_dims(img, axis=0))[0]
ind = (-pred).argsort()[:5]
latex = [class_names[x] for x in ind]
print(latex)

# store the classes
# with open('class_names.txt', 'w') as file_handler:
#     for item in class_names:
#         file_handler.write("{}\n".format(item))

# save and convert
model.save('keras.h5')

import tensorflowjs as tfjs
tfjs_target_dir = './'
tfjs.converters.save_keras_model(model, tfjs_target_dir)