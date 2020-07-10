<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 企业名称
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-row class="content center">
            <el-col :span="22">
                <h3>{{org.name}}</h3>
            </el-col>
            <el-col :span="2">
                <el-link type="warning" @click="titleVisible=true">编辑</el-link>
            </el-col>
        </el-row>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 基本信息
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-row  class="head">
            <el-col>
                <el-row>
                    <el-col :span="10" class="leftCol">成立日期</el-col>
                    <el-col :span="12" class="rightCol">{{org.establishedTime | formatDate}}</el-col>
                </el-row>
                <el-row style="margin-top:10px;">
                    <el-col :span="10" class="leftCol">经营范围</el-col>
                    <el-col :span="12" class="rightCol">{{org.businessScope}}</el-col>
                </el-row>
                <el-row  style="margin-top:10px;">
                    <el-col :span="10" class="leftCol">安全举报邮箱</el-col>
                    <el-col :span="12" class="rightCol">{{org.email}}</el-col>
                </el-row>
                <el-row style="margin-top:10px;">
                    <el-col :span="10" class="leftCol">安全举报电话</el-col>
                    <el-col :span="12" class="rightCol">{{org.reportTel}}</el-col>
                </el-row>
                <el-row style="margin-top:10px;">
                    <el-col :span="22">&nbsp;  </el-col>
                    <el-col :span="2" style="text-align: center;">
                        <el-link type="warning" @click="headVisible=true">编辑</el-link>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 简介
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-row class="introduction">
            <el-col :span="24" style="text-align: left;">

                <el-row>
                    <el-col>&nbsp;<div v-html="org.introduction"></div></el-col>
                </el-row>
                <el-row>
                    <el-col :span="22" style="text-align: left;">
                        &nbsp;
                    </el-col>
                    <el-col :span="2" style="text-align: center;">
                        <el-link type="warning" @click="handleEditIntroduction">编辑</el-link>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
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
        <el-dialog title="编辑企业简介" :visible.sync="introductionVisible" width="40%">
            <el-form ref="form" :rules="rules" :model="org" label-width="100px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="企业简介" prop="name">
                            <!--<el-input type="textarea"  rows="15" v-model="org.introduction"></el-input>-->
                            <vue-editor v-model="org.introduction"></vue-editor>
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
                <el-row type="flex" class="row-bg">
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
                </el-row>
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
                titleVisible:false,
                headVisible:false,
                introductionVisible:false,
                org:{},
                orgImgs:[],
                orgDocs:[],
                introduction:'',
                rules:{
                    name:[{required:true,message:'请输入企业名称',trigger:'blur'}]
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
            this.getData();
        },
        methods: {
            handleEditIntroduction(){
                this.introductionVisible=true;
                // this.introduction = this.org.introduction;
            },
            getData(){
                this.$axios.get("/org/orgInfo").then(res => {
                    this.org = res.data.org;
                    this.orgImgs = res.data.orgImgList;
                    this.orgDocs = res.data.orgDocList;
                }).catch(error=>{
                    console.log(error);
                })
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
    .content{
        background-color: white;
        border-radius: 6px;
    }
    .center{
        text-align: center;
    }
    .titleText{
        color:#0f0f0f;
    }
    .el-row{
        width:100%;
    }
    .leftCol{
        text-align: right;
        margin-right: 10px;
    }
    .rightCol{
        text-align: left;
        margin-left: 10px;
    }
    .ligthGray{
        background-color:#FFF;
    }
    .head{
        background-color: #FFF;
        border-radius: 6px;
    }
    .introduction{
        background-color: #FFF;
        border-radius: 6px;
        padding-left: 20px;
    }
</style>
