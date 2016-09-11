--  Copyright (c) 2015, Omkar M. Parkhi
--  All rights reserved.

require 'image'
require 'nn'

require 'cutorch'
require 'cunn'
require 'dpnn'


function preprocessImage(name)
    local im = image.load(name,3,'float')
    im = im*255
    local im_bgr = im
    local mean = {129.1863,104.7624,93.5940}
    for i=1,3 do im_bgr[i]:add(-mean[i]) end
    return im:index(1,torch.LongTensor{3,2,1}):cuda()
end

local net = torch.load('./VGG_FACE.t7'):float()
net:remove(40) -- remove last layer of image so that we get the last fully connected output
net:remove(39)
net:evaluate()

net = net:cuda()
    
function evaluateNet(image, net2)
    local vec = net:forward(image):double()
    return vec:mul(1/torch.norm(vec))
end

local answer
repeat
   answer=io.read()
   img = preprocessImage(answer)

   res = evaluateNet(img)
   print(res)
   io.flush()
until answer=="stop"



