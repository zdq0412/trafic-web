<template>
    <div style="width:100%;min-width: 200px;border-radius: 6px;padding-top:20px;background-color: #FFF;">
        <div style="float:right;margin-top:10px;margin-right:10px;">
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="el-dropdown-link">
                编辑<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="name">企业名称</el-dropdown-item>
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
        </div>

        <!--预览图片-->
        <el-dialog :visible.sync="dialogVisible">
            <img style="width: 100%;" :src="dialogImageUrl" alt="">
        </el-dialog>


        <el-dialog title="编辑企业名称" :visible.sync="titleVisible" width="40%">
            <el-form ref="form" :rules="rules" :model="org" label-width="100px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="企业名称" prop="name">
                            <el-input v-model="org.name"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
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
        <el-dialog title="编辑企业简介" :visible.sync="introductionVisible" width="40%">
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
        <el-dialog title="编辑基本信息" :visible.sync="headVisible" width="40%">
            <el-form ref="form" :rules="rules" :model="org" label-width="100px">
                <!--<el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="成立日期">
                            <el-date-picker
                                    v-model="org.establishedTime"
                                    type="date"
                                    placeholder="选择日期">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="经营范围">
                            <el-input type="textarea" v-model="org.businessScope"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>-->
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
                imgVisible:false,
                dialogVisible:false,
                dialogImageUrl:'',
                orgImgs:[],
                orgDocs:[],
                introduction:'',
                baseUrl:'',
                isShowLayers:[],
                rules:{
                    name:[{required:true,message:'请输入名称',trigger:'blur'}]
                }
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
                        this.$axios.put("/org/org?" + this.$qs.stringify(this.org)).then(res => {
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
    .demonstration {
        display: block;
        color: #8492a6;
        font-size: 14px;
        margin-bottom: 20px;
    }
</style>
