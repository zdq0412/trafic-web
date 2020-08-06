<template>
    <div style="width:100%;min-width: 200px;border-radius: 6px;padding-top:20px;background-color: #FFF;">
        <div style="float:right;margin-top:10px;margin-right:10px;">
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="el-dropdown-link">
                编辑<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="name">企业基本信息</el-dropdown-item>
                    <el-dropdown-item command="introduction">企业介绍</el-dropdown-item>
                    <el-dropdown-item command="baseInfo">举报信息</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <!--企业名称-->
        <div class="name">
            <h3>{{org.name}}</h3>
        </div>
        <!--企业介绍-->
        <div class="introduction" v-html="org.introduction">
        </div>
        <!--企业基本信息-->
        <div class="baseInfo">
            <div style="display:inline-block;">
                <label>安全举报电话:</label>
                <span> {{org.reportTel}}</span>
            </div>
            <div style="display:inline-block;margin-left:20px;">
                <label>安全举报邮箱:</label>
                <span> {{org.email}}</span>
            </div>
        </div>
        <!--企业图片-->
        <div style="width: 100%;">
            <div @mouseover="showLayer(index)" @mouseout="hiddenLayer(index)" style="position: relative; height: 200px;width:200px;
            margin-left: 10px;display: inline-block;"   v-for="(orgImg,index) in orgImgs">
                <div style="width: 100%;height:100%;">
                    <img  class="el-upload-list__item-thumbnail" style="width: 100%;height:80%; border-radius: 10px;"
                          :src="baseUrl + '/' + orgImg.url" alt="">
                    <div style="text-align: center;line-height: 100%;height: 18%;width:100%;font-size: 12px;margin-top:2%;">
                        <label>{{orgImg.name}}</label>
                    </div>
                </div>
                <!--遮罩层-->
                <div v-show="isShowLayers[index]" style="position: absolute;top:0px;left:0px; width:100%; height: 100%;line-height:200px;opacity: 0.5;
                 display:inline-block;text-align: center;vertical-align: middle;background-color: #F0F0F0;">
                            <span   @click="handlePictureCardPreview(orgImg)" style="cursor:pointer;">
                              <i class="el-icon-zoom-in" style="font-size: 30px;"></i>
                            </span>
                    <span  @click="handleEdit(orgImg)" style="margin-left: 20px;cursor:pointer;">
                              <i class="el-icon-edit" style="font-size: 30px;"></i>
                            </span>
                    <span  @click="handleRemove(orgImg)" style="margin-left: 20px;cursor:pointer;">
                              <i class="el-icon-delete" style="font-size: 30px;"></i>
                            </span>
                </div>
            </div>
            <div style="display: inline-block;margin-left: 10px;">
                <div  class="avatar-uploader" style="height: 200px;width:200px;" @click="uploadVisible=true">
                    <i class="el-icon-plus avatar-uploader-iconBtn"></i>
                </div>
            </div>
        </div>
        <!--资质文件-->
        <div style="width: 100%;">
            <div class="crumbs" style="background-color: #F0F0F0;padding-top:10px;">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item>
                        <i class="el-icon-lx-cascades"></i> 资质文件
                    </el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="container">
                <div class="handle-box">
                    <el-button
                            type="primary"
                            icon="el-icon-plus"
                            class="handle-del mr10"
                            @click="handleAddOrgDoc"
                    >新增</el-button>
                </div>
                <el-table
                        :data="orgDocs"
                        border
                        class="table"
                        ref="orgDocTable"
                        header-cell-class-name="table-header"
                >
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="docNum" label="文件编号"></el-table-column>
                    <el-table-column prop="url" label="照片" align="center">
                        <template slot-scope="scope">
                            <el-image
                                    class="table-td-thumb"
                                    :src="baseUrl + '/' + scope.row.url"
                                    :preview-src-list="[baseUrl + '/' +scope.row.url]"
                            ></el-image>
                        </template>
                    </el-table-column>
                    <el-table-column prop="beginDate" label="有效期开始" :formatter="dateFormatter"></el-table-column>
                    <el-table-column prop="endDate" label="有效期结束" :formatter="dateFormatter"></el-table-column>
                    <el-table-column prop="uploadDate" label="上传日期" :formatter="dateFormatter"></el-table-column>
                    <el-table-column label="操作" width="230" align="center">
                        <template slot-scope="scope">
                            <el-button
                                    type="text"
                                    icon="el-icon-edit"
                                    @click="handleEditOrgDoc(scope.$index, scope.row)"
                            >编辑</el-button>
                            <el-button
                                    type="text"
                                    icon="el-icon-delete"
                                    class="red"
                                    @click="handleDelete(scope.$index, scope.row)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <!--新增企业资质-->
        <el-dialog title="新增" :visible.sync="addOrgDocVisible" width="30%" >
            <el-form ref="form" :rules="rules" :model="orgDoc" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="orgDoc.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="文件编号" prop="docNum">
                    <el-input v-model="orgDoc.docNum"></el-input>
                </el-form-item>
                <el-form-item label="照片">
                    <div>
                        <el-upload
                                class="avatar-uploader"
                                ref="upload_add"
                                :data="orgDocData"
                                :action="uploadOrgDocUrl"
                                :headers="headers"
                                accept="image/*"
                                :auto-upload="false"
                                :on-change="handlePhotoChange"
                                :show-file-list="false"
                                :on-success="handleAvatarSuccess"
                                :before-upload="beforeAvatarUpload">
                            <img v-if="imageUrl" :src="imageUrl" class="avatar">
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </div>
                </el-form-item>
                <el-form-item label="有效期开始" prop="beginDate">
                    <el-date-picker
                            v-model="orgDoc.beginDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="有效期结束" prop="endDate">
                    <el-date-picker
                            v-model="orgDoc.endDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addOrgDocVisible=false">取 消</el-button>
                <el-button type="primary" @click="saveAddOrgDoc">确 定</el-button>
            </span>
        </el-dialog>
        <!--编辑企业资质-->
        <el-dialog title="编辑" :visible.sync="editOrgDocVisible" width="30%" >
            <el-form ref="form" :rules="rules" :model="orgDoc" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="orgDoc.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="文件编号" prop="docNum">
                    <el-input v-model="orgDoc.docNum"></el-input>
                </el-form-item>
                <el-form-item label="照片">
                    <div>
                        <el-upload
                                class="avatar-uploader"
                                ref="upload_modify"
                                :data="orgDocData"
                                :action="uploadOrgDocUrl"
                                :headers="headers"
                                accept="image/*"
                                :auto-upload="false"
                                :on-change="handlePhotoChange"
                                :show-file-list="false"
                                :on-success="handleAvatarSuccess"
                                :before-upload="beforeAvatarUpload">
                            <img v-if="imageUrl" :src="imageUrl" class="avatar">
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </div>
                </el-form-item>
                <el-form-item label="有效期开始" prop="beginDate">
                    <el-date-picker
                            v-model="orgDoc.beginDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="有效期结束" prop="endDate">
                    <el-date-picker
                            v-model="orgDoc.endDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editOrgDocVisible=false">取 消</el-button>
                <el-button type="primary" @click="saveEditOrgDoc">确 定</el-button>
            </span>
        </el-dialog>

        <!--预览图片-->
        <el-dialog :visible.sync="dialogVisible">
            <img style="width: 100%;" :src="dialogImageUrl" alt="">
        </el-dialog>

        <!--上传图片-->
        <el-dialog title="上传" :visible.sync="uploadVisible" width="30%" >
            <el-form ref="form" :rules="rules" :model="orgImg" label-width="50px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="orgImg.name"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload
                            class="avatar-uploader"
                            ref="upload"
                            :data="updata"
                            :action="uploadUrl"
                            :headers="headers"
                            accept="image/*"
                            :auto-upload="false"
                            :on-change="handlePhotoChange"
                            :show-file-list="false"
                            :on-success="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetForm">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="编辑企业基础信息" :visible.sync="titleVisible" width="60%">
            <el-form ref="form" :rules="rules" :model="org" label-width="100px">
                    <el-col>
                            <el-row type="flex" class="row-bg">
                                <el-col>
                                    <el-form-item label="名称" prop="name">
                                        <el-input v-model="org.name" maxlength="50"
                                                  show-word-limit></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col>
                                    <el-form-item label="简称" prop="shortName">
                                        <el-input v-model="org.shortName"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row type="flex" class="row-bg">
                                <el-col>
                                    <el-form-item label="联系人">
                                        <el-input v-model="org.contact"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col>
                                    <el-form-item label="手机号" prop="tel">
                                        <el-input v-model="org.tel"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row type="flex" class="row-bg">
                                <el-col>
                                    <el-form-item label="地址">
                                        <el-input v-model="org.addr"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col>
                                    <el-form-item label="法人">
                                        <el-input v-model="org.legalPerson"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row type="flex" class="row-bg" >
                                <el-col >
                                    <el-form-item label="备注">
                                        <el-input type="textarea" v-model="org.note"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                    </el-col>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="titleVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="编辑图片名称" :visible.sync="imgVisible" width="40%">
            <el-form ref="form" :rules="rules" :model="orgImg" label-width="100px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="图片名称" prop="name">
                            <el-input v-model="orgImg.name"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="imgVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditImg">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="编辑企业简介" :visible.sync="introductionVisible" width="60%">
            <el-form ref="form" :rules="rules" :model="org" label-width="100px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="企业简介" prop="name">
                            <!--<el-input type="textarea"  rows="15" v-model="org.introduction"></el-input>-->
                            <vue-editor id="editor" v-model="org.introduction" :editor-toolbar="customToolbar" useCustomImageHandler @image-added="handleImageAdded"></vue-editor>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="introductionVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveIntroduction">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="编辑基本信息" :visible.sync="headVisible" width="60%">
            <el-form ref="form" :rules="rules" :model="org" label-width="100px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="安全举报邮箱">
                            <el-input v-model="org.email"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="安全举报电话">
                            <el-input v-model="org.reportTel"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="headVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {getDate} from "../common/utils";
    import { VueEditor } from "vue2-editor";
    export default {
        name: 'introduction',
        components:{
            VueEditor
        },
        data() {
            return {
                customToolbar: [
                    ["bold", "italic", "underline"]
                ],
                titleVisible:false,
                headVisible:false,
                introductionVisible:false,
                org:{},
                orgImg:{},
                orgDoc:{},
                imageUrl:'',
                imgVisible:false,
                dialogVisible:false,
                dialogImageUrl:'',
                orgImgs:[],
                addOrgDocVisible:false,
                editOrgDocVisible:false,
                orgDocs:[],
                uploadVisible:false,
                introduction:'',
                isSelectFile:false,
                baseUrl:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                uploadUrl:'',
                uploadOrgDocUrl:'',
                isShowLayers:[],
                rules:{
                    name:[{required:true,message:'请输入名称',trigger:'blur'}],
                    docNum:[{required:true,message:'请输入文件编号',trigger:'blur'}],
                    beginDate:[{required:true,message:'请选择开始日期',trigger:'blur'}],
                    endDate:[{required:true,message:'请选择截止日期',trigger:'blur'}]
                }
            }
        },
        computed:{
            updata:function(){
                return {"orgId":this.org.id,"name":this.orgImg.name};
            },
            orgDocData:function(){
                return this.orgDoc;
            }
        },
        filters:{
            formatDate(date){
                if(date){
                    let formatedDate = getDate(new Date(date));
                    return formatedDate;
                }else{
                    return '';
                }
            }
        },
        created(){
            this.baseUrl = this.$baseURL;
            this.getData();
            this.uploadUrl = this.$baseURL + "/orgImg/photos";
        },
        methods: {
            // 删除操作
            handleDelete(index, row) {
                this.form = row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/orgDoc/orgDoc/" + row.id).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.$message.success('删除成功');
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(error => {
                            console.log(error);
                        });
                    })
                    .catch(() => {
                    });
            },
            saveEditOrgDoc(){
                this.$refs.form.validate(validate => {
                    if (validate) {
                        if(this.isSelectFile) {
                            this.$refs.upload_modify.submit();
                        }else{
                            this.$axios.post("/orgDoc/updateOrgDocNoPhoto",this.$qs.stringify(this.orgDoc)).then(res=>{
                                this.editOrgDocVisible= false;
                                this.getData();
                                this.isSelectFile = false;
                            }).catch(error=>{
                                console.log(error);
                            });
                        }
                    } else {
                        return false;
                    }
                });
            },
            saveAddOrgDoc(){
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate => {
                    if (validate) {
                        //触发组件的action
                        this.$refs.upload_add.submit();
                    } else {
                        return false;
                    }
                });
            },
            handleAddOrgDoc(){
                this.imageUrl = false;
                this.addOrgDocVisible=true;
                this.orgDoc={};
                this.isSelectFile = false;
                this.uploadOrgDocUrl=this.$baseURL + "/orgDoc/addOrgDoc";
            },
            dateFormatter(row,column,cellValue){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            resetForm() {
                this.uploadVisible = false;
                this.imageUrl = '';
            },
            saveAdd(){
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate => {
                    if (validate) {
                        //触发组件的action
                        this.$refs.upload.submit();
                    } else {
                        return false;
                    }
                });
            },
            handlePhotoChange(file){
                this.imageUrl=URL.createObjectURL(file.raw);
                this.isSelectFile = true;
            },
            handleAvatarSuccess(res, file) {
                this.uploadVisible= false;
                this.getData();
                this.orgImg={};
                this.imageUrl = '';
                this.isSelectFile = false;
                this.addOrgDocVisible = false;
                this.editOrgDocVisible = false;
            },
            beforeAvatarUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2;
                const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';

                if (!isJPG && !isGIF && !isPNG && !isBMP) {
                    this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!');
                }
                return isJPG && isLt2M;
            },
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
                    this.$axios.delete("/orgImg/orgImg/" + orgImg.id).then(res => {
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
            handleImageAdded: function(file, Editor, cursorLocation, resetUploader) {
                let formData = new FormData();
                formData.append("files", file);
                formData.append("orgId",this.org.id);
                this.$axios({
                    url: "/orgImg/photos",
                    method: "POST",
                    data: formData
                })
                    .then(res => {
                        if(res.data.data && res.data.data.length>0){
                            let url = this.$baseURL + "/" + res.data.data[0]; // Get url from response
                            Editor.insertEmbed(cursorLocation, "image", url);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            handleCommand(command){
                switch (command) {
                    case 'name':{
                        this.titleVisible = true;
                        break;
                    }
                    case 'introduction':{
                        this.introductionVisible = true;
                        break;
                    }
                    case 'baseInfo':{
                        this.headVisible=true;
                        break;
                    }
                }
            },
            handleEditIntroduction(){
                this.introductionVisible=true;
            },
            handleEdit(orgImg){
                this.orgImg = orgImg;
                this.imgVisible = true;
            },
            handleEditOrgDoc(index,row){
              this.uploadOrgDocUrl = this.$baseURL + "/orgDoc/updateOrgDoc";
              this.editOrgDocVisible=true;
              this.orgDoc = row;
              if(row.beginDate){
                  this.orgDoc.beginDate=getDate(new Date(row.beginDate));
              }
              if(row.endDate){
                  this.orgDoc.endDate=getDate(new Date(row.endDate));
              }
              this.imageUrl = this.$baseURL + "/" + row.url;
            },
            getData(){
                this.$axios.get("/org/orgInfo").then(res => {
                    this.org = res.data.org;
                    this.orgImgs = res.data.orgImgList;
                    //将所有图片层设置为不显示
                    if(this.orgImgs&&this.orgImgs.length>0){
                        for(let i = 0;i<this.orgImgs.length;i++){
                            this.isShowLayers.push(false);
                        }
                    }
                    this.orgDocs = res.data.orgDocList;
                }).catch(error=>{
                    console.log(error);
                })
            },
            saveEditImg(){
                this.$refs.form.validate(validate=>{
                    console.log(this.orgImg);
                    if(validate){
                        this.$axios.put("/orgImg/orgImg?" + this.$qs.stringify(this.orgImg)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.imgVisible = false;
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                });
            },
            saveEdit(){
                this.$refs.form.validate(validate=>{
                    if(validate){
                        this.$axios.post("/org/updateOrg" ,this.$qs.stringify(this.org)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.titleVisible = false;
                                this.headVisible = false;
                                this.introductionVisible = false;
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                });
            },
            saveIntroduction(){
                this.$refs.form.validate(validate=>{
                    if(validate){
                        if(this.org.establishedTime){
                            this.org.establishedTime = getDate(new Date(this.org.establishedTime));
                        }
                        this.$axios.post("/org/orgIntroduction" , this.$qs.stringify(this.org)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.titleVisible = false;
                                this.headVisible = false;
                                this.introductionVisible = false;
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                });
            }
        }
    };
</script>
<style scoped>
    .name{
        text-align: left;
        margin-left: 20px;
        margin-bottom: 20px;
        color: #0156B4;
    }
    .baseInfo{
        margin: 20px;
        padding-bottom: 20px;
        font-weight: bold;
        color:red;
    }
    .introduction{
        line-height:200%;
        margin-left: 20px;
        margin-right:20px;
        text-indent: 30px;
    }
    .el-dropdown-link {
        cursor: pointer;
        color: #409EFF;
    }
    .el-icon-arrow-down {
        font-size: 12px;
    }
    .avatar-uploader ,.el-upload{
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        width:100px;
        height:100px;
    }
    .avatar-uploader:hover,.el-upload:hover {
        border-color: #409EFF;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
    .avatar-uploader-iconBtn {
        font-size: 28px;
        color: #8c939d;
        width: 200px;
        height: 200px;
        line-height: 200px;
        text-align: center;
        float: left;
    }
    .avatar{
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
    .table-td-thumb{
        height:50px;
        width:50px;
    }
</style>
