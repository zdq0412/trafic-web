/**
 * 校验上传文件是否为空
 * @param fileList 文件列表
 */
function validateUploadFile(fileList){
    if(!fileList || fileList.length<=0){
        return false;
    }else{
        return true;
    }
}


export {validateUploadFile}