<template>
    <div class="login-wrap">
        <el-tabs v-model="activeName"  style="position:absolute;top:50%;left:50%;margin: -300px 0 0 -175px;
width:500px;text-align: center;height:500px;" stretch>
            <el-tab-pane label="登录" name="login" >
                <transition name="el-fade-in-linear">
                    <div class="ms-login">
                        <!--<div class="ms-title">后台管理系统</div>-->
                        <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
                            <el-form-item prop="username">
                                <el-input v-model="param.username" maxlength="50" tabindex="1" placeholder="username">
                                    <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                                </el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input tabindex="2"
                                          show-password
                                          maxlength="16"
                                          placeholder="password"
                                          v-model="param.password"
                                          @keyup.enter.native="submitForm()"
                                >
                                    <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                                </el-input>
                            </el-form-item>
                            <div class="login-btn">
                                <el-button type="primary" tabindex="3" @click="submitForm()">登录</el-button>
                                <!--<router-link to="/reg">
                                    <el-link type="primary" >还没有账户?点击注册!</el-link>
                                </router-link>-->
                            </div>
                        </el-form>
                    </div>
                </transition>
            </el-tab-pane>

            <el-tab-pane label="注册" name="register">
                <transition name="el-fade-in-linear">
                    <div class="ms-login">
                        <!--<div class="ms-title">后台管理系统</div>-->
                        <el-form ref="regForm" :rules="rules" :model="form" class="ms-content" label-width="15px">
                            <!--<el-form-item label=" " prop="code">
                                <el-input v-model="form.code" tabindex="1" placeholder="企业代码">
                                </el-input>
                            </el-form-item>-->
                            <el-form-item label=" " prop="name">
                                <el-input v-model="form.name" maxlength="50"  tabindex="2" placeholder="企业名称">
                                </el-input>
                            </el-form-item>
                            <el-form-item label=" " prop="shortName">
                                <el-input v-model="form.shortName" maxlength="10"  tabindex="2" placeholder="企业简称">
                                </el-input>
                            </el-form-item>
                            <el-form-item label=" " prop="legalPerson">
                                <el-input v-model="form.legalPerson" maxlength="10"  tabindex="2" placeholder="企业法人">
                                </el-input>
                            </el-form-item>
                            <el-form-item label=" ">
                                <el-input v-model="form.contact" maxlength="10"  tabindex="3" placeholder="联系人">
                                </el-input>
                            </el-form-item>
                            <el-form-item prop="tel" label=" ">
                                <el-input v-model="form.tel" tabindex="4" maxlength="11"  placeholder="手机号">
                                </el-input>

                            </el-form-item>
                            <!--<el-form-item label=" ">
                                <el-input v-model="form.addr" tabindex="5" placeholder="地址">
                                </el-input>
                            </el-form-item>
                            <el-form-item label=" ">
                                <el-input v-model="form.legalPerson" tabindex="6" placeholder="法人">
                                </el-input>
                            </el-form-item>-->
                            <el-form-item prop="area" label=" ">
                                <el-cascader style="width: 100%;" tabindex="7"
                                             v-model="form.area"
                                             :options="areas"
                                             :props="{label:'name',value:'id'}"
                                             @change="handleChange"
                                             placeholder="地区">
                                </el-cascader>
                            </el-form-item>
                            <el-form-item prop="orgCategoryId" label=" ">
                                <el-select v-model="form.orgCategoryId"  tabindex="8"
                                           placeholder="企业类别" style="width: 100%;" >
                                    <el-option
                                            v-for="item in orgCategories"
                                            :key="item.id"
                                            :label="item.name"
                                            :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                           <!-- <el-form-item label=" ">
                                <el-input type="textarea" v-model="form.note" tabindex="9" placeholder="备注">
                                </el-input>
                            </el-form-item>-->
                            <el-form-item>
                                <span style="color:#F56C6C;">手机号将作为您的用户名，初始密码为手机号后6位,请登录后修改!</span>
                            </el-form-item>
                            <div class="login-btn">
                                <el-button type="primary" tabindex="10" @click="register">注册</el-button>
                            </div>
                        </el-form>
                    </div>
                </transition>
            </el-tab-pane>
        </el-tabs>

        <!--<div style="color:red;margin-top:5px;font-size:12px;">建议使用火狐或谷歌浏览器!</div>-->
    </div>
</template>

<script>
    export default {
        data: function() {
            let checkTel=(rule, value, callback) =>{
                if(value){
                    var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
                    if (!myreg.test(value)) {
                        callback(new Error("不是有效的手机号码格式!"));
                    } else {
                        callback();
                    }
                }  else{
                    callback(new Error("请输入手机号"));
                }
            };
            return {
                activeName:'login',
                form:{},
                orgCategories:[],
                areas:[],
                param: {
                    username: '',
                    password: '',
                },
                rules: {
                    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
                    name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
                    code: [{ required: true, message: '请输入企业代码', trigger: 'blur' }],
                    shortName: [{ required: true, message: '请输入企业简称', trigger: 'blur' }],
                    legalPerson: [{ required: true, message: '请输入企业法人', trigger: 'blur' }],
                    tel: [{ required: true, message: '请输入手机号码', trigger: 'blur' },{
                        validator:checkTel,trigger:'blur'
                    }],
                    area: [{ type:'array', required: true, message: '请选择区域', trigger:['blur','change'] }],
                    orgCategoryId: [{ required: true, message: '请选择企业类别', trigger: ['blur','change'] }]
                },
            };
        },
        created(){
            this.loadSelectData();
        },
        methods: {
            loadSelectData(){
                this.$axios.get("/orgCategory/orgCategorys").then(res => {
                    this.orgCategories = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
                this.$axios.get("/category/categorys",{
                    params:{
                        type:'区域'
                    }
                }).then(res => {
                    this.areas = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            handleChange(){
                if(this.form.area&&this.form.area.length>0){
                    this.form.provinceId=this.form.area[0];
                    this.form.cityId=this.form.area[1];
                    this.form.regionId=this.form.area[2];
                }
            },
            register(){
                this.$refs.regForm.validate(valid => {
                    if(valid){
                        this.$axios.post("/org/org",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.$message.success("注册成功，请等待管理员审核!");
                            }else{
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err =>{
                            console.log(err);
                        });
                    }else{
                        return false;
                    }
                });
            },
            submitForm() {
                this.$refs.login.validate(valid => {
                    const that = this;
                    if (valid) {
                        //解决后台接收不到参数问题
                        this.$axios.post("/login",this.$qs.stringify({username:this.param.username,password:this.param.password})).then(function (res) {
                            if(res.data.result.resultCode===200){
                                localStorage.setItem('username', that.param.username);
                                let token = res.data.data;
                                localStorage.setItem("token",token);
                                //登录类型：User：用户  AreaManager：区域管理员
                                //登录类型不同，登录成功后访问的资源不同
                                var loginType = token.substring(token.lastIndexOf("-")+1);
                                if(loginType=='AreaManager'){

                                }
                                if(loginType=="User"){
                                    that.$router.push("/");
                                }
                            }else{
                                that.$alert("用户名或密码错误!");
                            }
                        }).catch(function(error){
                            that.$message.error("登陆失败，网络连接不可用!");
                        });
                    } else {
                        this.$message.error('请输入账号和密码');
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
        },
    };
</script>

<style scoped>
    .login-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        /*background-image: url(../../assets/img/login-bg.jpg);*/
        background: url(../../assets/img/bg.jpg) no-repeat;
        background-size: 100% 100%;
        overflow: auto;
    }
    .ms-title {
        width: 100%;
        line-height: 50px;
        text-align: center;
        font-size: 20px;
        color: #fff;
        border-bottom: 1px solid #ddd;
    }
    .ms-login {
        /* position: absolute;
         left: 50%;
         top: 50%;*/
        width: 100%;
        /*margin: -190px 0 0 -175px;*/
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.3);
        overflow: hidden;
    }
    .ms-content {
        padding: 30px 30px;
    }
    .login-btn {
        text-align: center;
    }
    .login-btn button {
        width: 100%;
        height: 36px;
        margin-bottom: 10px;
    }
    .login-tips {
        font-size: 12px;
        line-height: 30px;
        color: #fff;
    }
</style>