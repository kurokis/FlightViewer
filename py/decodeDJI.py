import sys
import pandas as pd
import numpy as np

filename = str(sys.argv[1])
df = pd.read_csv(filename, index_col=False)

### Headers in output file ###
headers = ['Time (s)','Latitude (deg)','Longitude (deg)',
	'GPS Altitude (m)','Barometric Altitude (m)',
	'Quaternion W','Quaternion X','Quaternion Y','Quaternion Z',
	'Roll (deg)','Pitch (deg)','Yaw (deg)',
	'Accelerometer X (g)','Accelerometer Y (g)','Accelerometer Z (g)',
	'Gyro X (deg/s)','Gyro Y (deg/s)','Gyro Z (deg/s)',
	'Magnetic X (G)','Magnetic Y (G)','Magnetic Z (G)']

### Headers in DJI Log ###
#Latitude (Deg), Longitude (Deg), GPS Altitude (m),
# N Velocity(m/s), E Velocity(m/s), D Velocity(m/s),
# Velocity(m/s), Ground Speed(m/s),
# AccelerometerX(g), AccelerometerY(g), AccelerometerZ(g),
# GyroX(rad/s), GyroY(rad/s), GyroZ(rad/s), 
# Barometric Alt(m),
# QuaternionX, QuaternionY, QuaternionZ, QuaternionW,
# Roll(deg), Pitch(deg), Yaw(deg),
# MagneticX, MagneticY, MagneticZ,
# Satellites, Sequence(135 Hz) 

### Remove leading and trailing spaces from column names
columns_dirty = df.columns.values
columns_clean = [c.lstrip(' ').strip(' ') for c in columns_dirty]
df.columns = columns_clean

### time
sequence = np.array(df['Sequence(135 Hz)'].values)
time = (sequence-sequence[0])/135.

### latitude, longitude, gps_altitude, barometric_altitude
### quaternion, euler angles, accelerometer
latitude = np.array(df['Latitude (Deg)'].values)
longitude = np.array(df['Longitude (Deg)'].values)
gps_altitude = np.array(df['GPS Altitude (m)'].values)
barometric_altitude = np.array(df['Barometric Alt(m)'].values)
qw = np.array(df['QuaternionW'].values)
qx = np.array(df['QuaternionX'].values)
qy = np.array(df['QuaternionY'].values)
qz = np.array(df['QuaternionZ'].values)
roll = np.array(df['Roll(deg)'].values)
pitch = np.array(df['Pitch(deg)'].values)
yaw = np.array(df['Yaw(deg)'].values)
accelerometerx = np.array(df['AccelerometerX(g)'].values)
accelerometery = np.array(df['AccelerometerY(g)'].values)
accelerometerz = np.array(df['AccelerometerZ(g)'].values)

### gyro
gyrox = np.array(df['GyroX(rad/s)'].values)*180./np.pi
gyroy = np.array(df['GyroY(rad/s)'].values)*180./np.pi
gyroz = np.array(df['GyroZ(rad/s)'].values)*180./np.pi

### magnetic
magneticx = np.array(df['MagneticX'].values)
magneticy = np.array(df['MagneticY'].values)
magneticz = np.array(df['MagneticZ'].values)

### stack data
data = np.vstack((time,
	latitude,longitude,
	gps_altitude,barometric_altitude,
	qw,qx,qy,qz,
	roll,pitch,yaw,
	accelerometerx,accelerometery,accelerometerz,
	gyrox,gyroy,gyroz,
	magneticx,magneticy,magneticz)).transpose()
	
### trim initial data without GPS position
atorigin = [L<0.01 for L in latitude]

data = data[atorigin.index(False):,:]

### write output
df2 = pd.DataFrame(data, columns = headers)
df2.index.name = 'Index'
df2.to_csv(filename.replace('.csv','_out.csv'))
