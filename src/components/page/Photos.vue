<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 现场照片
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                        type="primary"
                        icon="el-icon-upload"
                        class="handle-del mr10"
                        @click="$refs.fileUploadBtn.$el.click();"
                >上传</el-button>
               <!-- <el-button
                        type="danger"
                        icon="el-icon-delete"
                        class="handle-del mr10"
                        @click="addVisible=true;form={};"
                >批量删除</el-button>-->
            </div>
            <div style="width: 100%;">
                <div @mouseover="showLayer(index)" @mouseout="hiddenLayer(index)" style="position: relative; height: 200px;width:200px;
                      margin-left: 10px;display: inline-block;"   v-for="(orgImg,index) in photos">
                    <div style="width: 100%;height:100%;">
                        <img  class="el-upload-list__item-thumbnail" style="width: 100%;height:80%; border-radius: 10px;"
                                 :src="$baseURL + '/' + orgImg.url" alt="">
                    </div>
                    <!--遮罩层-->
                    <div v-show="isShowLayers[index]" style="position: absolute;top:0px;left:0px; width:100%; height: 100%;line-height:200px;opacity: 0.5;
                 display:inline-block;text-align: center;vertical-align: middle;background-color: #F0F0F0;">
                            <span   @click="handlePictureCardPreview(orgImg)" style="cursor:pointer;">
                              <i class="el-icon-zoom-in" style="font-size: 30px;"></i>
                            </span>
                        <span  @click="handleRemove(orgImg)" style="margin-left: 20px;cursor:pointer;">
                              <i class="el-icon-delete" style="font-size: 30px;"></i>
                            </span>
                    </div>
                </div>
            </div>
        </div>
        <el-upload style="display: none;"
                   :action="uploadUrl"
                   :auto-upload="true"
                   ref="uploadFile"
                   multiple
                   :data="param"
                   name="files"
                   :accept="ext"
                   :on-success="handleAvatarSuccess"
                   :before-upload="beforeAvatarUpload"
                   :headers="headers">
            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
        </el-upload>
        <!--预览图片-->
        <el-dialog :visible.sync="dialogVisible">
            <img style="width: 100%;" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>
<script>
    import {getDateTime} from "../common/utils";
    export default {
        name: 'basetable',
        data() {
            return {
                uploadUrl:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                photos:[],
                isShowLayers:[],
                param:{
                    pid:localStorage.getItem("pid"),
                    type:localStorage.getItem("type")
                },
                dialogImageUrl:'',
                dialogVisible:false,
                ext:'.jpg,.jpeg,.bmp,.png'
            };
        },
        created() {
            this.uploadUrl = this.$baseURL + "/pics/upload";
            this.getData();
        },
        activated(){
            //this.param.pid=localStorage.getItem("pid");
            //this.param.type=localStorage.getItem("type");
            this.getData();
        },
        methods: {
            hiddenLayer(index){
                this.isShowLayers[index]=false;
                this.$set(this.isShowLayers, index, false);
            },
            showLayer(index){
                this.isShowLayers[index]= true;
                this.$set(this.isShowLayers, index, true);
            },
            handleRemove(orgImg){
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$axios.delete("/pics/pics/" + orgImg.id).then(res => {
                        if (res.data.result.resultCode == 200) {
                            this.$message.success('删除成功');
                            this.getData();
                        } else {
                            this.$message.error(res.data.result.message);
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }).catch(() => {
                });
            },
            handlePictureCardPreview(orgImg){
                this.dialogImageUrl = this.$baseURL + "/" + orgImg.url;
                this.dialogVisible = true;
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDateTime(new Date(cellValue));
                }else{
                    return '';
                }
            },
            handleAvatarSuccess(res, file) {
                this.$message.success("上传成功!");
                this.getData();
            },
            beforeAvatarUpload(file) {
                const isLt5M = file.size / 1024 / 1024 < 5;
                const isJPG = file.type === 'image/jpeg';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';
                if(!isJPG && !isPNG && !isBMP){
                    this.$message.error('上传文件支持的类型：jpg、png、bmp!');
                    return false;
                }
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false
                }
                return  true;
            },
            getData() {
                this.$axios.get("/pics/pics",{
                    params:{
                        pid:localStorage.getItem("pid"),
                        type:localStorage.getItem("type")
                    }
                }).then(res => {
                    this.photos = res.data;
                }).catch(error => {
                    console.log(error);
                });
            }
        }
    };
</script>

<style scoped>
    @import "../../assets/css/common.css";
    .handle-box {
        margin-bottom: 20px;
    }
    .table {
        width: 100%;
        font-size: 14px;
    }
    .red {
        color: #ff0000;
    }
    .mr10 {
        margin-right: 10px;
    }
</style>
