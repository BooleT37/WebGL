canvasWidth = 160
canvasHeight = 160

def dotProduct(M, a):
	return [
		M[0][0] * a[0] + M[1][0] * a[1] + M[2][0] * a[2],
		M[0][1] * a[0] + M[1][1] * a[1] + M[2][1] * a[2],
		M[0][2] * a[0] + M[1][2] * a[1] + M[2][2] * a[2]
	]

def buildTransformMatrix(clipWidth, clipHeight, clipX, clipY):
	return (
		(clipWidth, 0, 0),
		(0, clipHeight, 0),
		(clipX, clipY, 1)
	)

paddingX = 10
paddingY = 20
imgWidth = 60
imgHeight = 30

aa = [(0, 0), (1, 0), (0, 1), (1, 1)]

#Строим оператор на основе сдвига по х и по y и ширины картинки по x и по y:
print("Medthod 1:")
clipWidth = imgWidth / canvasWidth * 2
clipHeight = imgHeight / canvasHeight * -2
clipX = paddingX / canvasWidth  *  2 - 1
clipY = paddingY / canvasHeight * -2 + 1
M1 = buildTransformMatrix(clipWidth, clipHeight, clipX, clipY)
print(M1)
for a in aa:
	print("{} -> {}".format(a, dotProduct(M1, (a[0], a[1], 1))))

#Строим оператор, переносящий изображение ровно в центр клипспейса, если оно меньше размера канваса
print("\nMedthod 2:")
kw = imgWidth / canvasWidth
kh = imgHeight / canvasHeight
M2 = buildTransformMatrix(kw * 2, - kh * 2, -kw, kh)
print(M2)
for a in aa:
	print("{} -> {}".format(a, dotProduct(M2, (a[0], a[1], 1))))
	
#Строим оператор, переносящий изображение ровно в центр клипспейса, если оно больше размера канваса
print("\nMedthod 3:")
canvasWidth = 80
canvasHeight = 100
imgWidth = 140
imgHeight = 120

kw = imgWidth / canvasWidth
kh = imgHeight / canvasHeight
if kw >= kh:
	k = kh / kw
	clipWidth = 2
	clipHeight = - k * 2
	clipX = -1
	clipY = k
else:
	k = kw / kh
	clipWidth = k * 2
	clipHeight = -2
	clipX = -k
	clipY = 1
M3 = buildTransformMatrix(clipWidth, clipHeight, clipX, clipY)

print(M3)
for a in aa:
	print("{} -> {}".format(a, dotProduct(M3, (a[0], a[1], 1))))