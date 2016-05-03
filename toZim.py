import os
import io
import json
from xml.dom.minidom import parseString
import re

TAG_RE = re.compile(r'<[^>]+>')

def remove_tags(text):
    return TAG_RE.sub('', text)

pathToZim = "~/Notebooks/#cookbook/"
jsonFolder = "backup/"
files=os.listdir(jsonFolder)

def convert(textAsUnicode):
    dom = parseString(obj["content"].encode("ascii","ignore"))
    note = dom.getElementsByTagName("en-note")[0]
    str = ""
    for node in note.childNodes:
        str=str.replace("<br clear=\"none\"/>","\n")
        str=str+"\n"+node.toxml()
    str = remove_tags(str)
    str=str.replace("&lt;","<")
    str=str.replace("&gt;",">")
    str=str.replace("&quot;",'"')
    return str

for fName in files:
    #print fName
    name = fName.replace(".json","")
    #print name
    f = open(jsonFolder+fName)
    obj = json.load(f)
    f.close()
    print obj["title"]
    f = io.open(pathToZim+name+".txt","wb")
    f.write("====== "+obj["title"]+" ======\n"+convert(obj["content"]))
    resources = obj["resources"]
    if resources:
        for resource in resources:
            #resource["data"]=None
            fileName = resource["attributes"]["fileName"]
            if not os.path.exists(pathToZim+name):
                os.mkdir(pathToZim+name)
            f.write("\n")
            f.write("{{./"+fileName+"}}")
            resFile = io.open(pathToZim+name+"/"+fileName,"wb")
            data = resource["data"]["_body"]
            count = resource["data"]["size"]
            dataBuffer =[]
            for i in range(0,count):
                dataBuffer.append(data[str(i)])
            resFile.write(bytearray(dataBuffer))
            resFile.close()
            print fileName
    f.close()
