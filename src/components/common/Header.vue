<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <div class="logo" v-if="user.org==null">后台管理系统</div>
        <div class="logo" v-else>{{user.org.name}}</div>
        <!--<el-radio v-model="radio1" :label="schema.id" border>{{schema.name}}</el-radio>-->
        <el-radio-group v-model="schemaId" style="height: 100px;"  @change="switchSchema()">
            <el-radio-button style="height: 100%;line-height: 100px;" v-for="schema in schemas"
                             border   :id="schema.id" :label="schema.id"
            >{{schema.name}}</el-radio-button>
        </el-radio-group>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>
                <!-- 用户头像 -->
                <div class="user-avator">
                    <img src="../../assets/img/img.jpg" v-if="!user.photo"/>
                    <img v-else :src="$baseURL + '/' + user.photo" />
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="uploadPhoto">上传头像</el-dropdown-item>
                        <el-dropdown-item command="modifyPassword">修改密码</el-dropdown-item>
                        <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <el-upload style="display: none;"
                    class="avatar-uploader"
                    ref="upload"
                    :action="uploadUrl"
                    :headers="headers"
                    :file-list="fileList"
                    accept="image/*"
                    :auto-upload="true"
                    :on-change="handlePhotoChange"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload">
                <el-button size="small" type="primary" ref="uploadBtn">点击上传</el-button>
            </el-upload>
        </div>
        <ModifyPassword ref="showDialog" ></ModifyPassword>
    </div>
</template>
<script>
    import bus from '../common/bus';
    import ModifyPassword from '../page/ModifyPassword';
    export default {
        props:['pf'],
        components:{
            ModifyPassword
        },
        data() {
            return {
                collapse: false,
                fullscreen: false,
                headers:{
                    token : localStorage.getItem("token")
                },
                uploadUrl:'',
                name: '',
                fileList:[],
                message:0,
                schemas:[],
                user:{},
                schemaId:''
            };
        },
        computed: {
            username() {
                let username = localStorage.getItem('username');
                return username ? username : this.name;
            }
        },
        created:function(){
            this.uploadUrl = this.$baseURL + "/user/photo";
           this.findUser();
        },
        methods: {
            findUser(){
                this.$axios.get("/user/userOrAreaManager/"+localStorage.getItem("username")).then(res=>{
                    this.user = res.data.data;
                    console.log(this.user);
                }).catch(error=>console.log(error))
            },
            handlePhotoChange(file,fileList){
                //this.imageUrl=URL.createObjectURL(file.raw);
                this.fileList = fileList.slice(-1);
            },
            handleAvatarSuccess(res, file) {
                this.$message.success("头像上传成功!");
                this.findUser();
            },
            beforeAvatarUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2;
                const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';
                if (!isJPG && !isGIF && !isPNG && !isBMP) {
                    this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!');
                    return false;
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!');
                    return false;
                }
                return true;
            },
            switchSchema(){
                this.$axios.get("/schema/switchSchema",{
                    params:{
                        schemaId:this.schemaId
                    }
                }).then(res=>{
                    //window.location.reload();
                    //调用菜单中的方法
                    this.pf();
                }).catch(error=>{
                    console.log(error)
                });
            },
            getData(){
                this.$axios.get("/schema/schemas").then(response => {
                    this.schemas = response.data.data;
                    if(this.schemas.length>0){
                        for(let i = 0;i<this.schemas.length;i++){
                            let schema = this.schemas[i];
                            if(schema.selected==true){
                                this.schemaId = schema.id;
                            }
                        }
                    }
                });
            },
            // 用户名下拉菜单选择事件
            handleCommand(command) {
                if (command == 'logout') {
                    this.$confirm('确认退出?', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$axios.post("/logout").then(response => {
                            localStorage.removeItem('username');
                            localStorage.removeItem('token');
                            this.$router.push('/login');
                        });
                    }).catch(error => {

                    });
                }
                //弹出修改密码窗口
                if(command == 'modifyPassword'){
                    this.$refs.showDialog.dialogFormVisible=true;
                }
                //上传头像
                if(command == 'uploadPhoto'){
                    this.$refs.uploadBtn.$el.click();
                }
            },
            // 侧边栏折叠
            collapseChage() {
                this.collapse = !this.collapse;
                bus.$emit('collapse', this.collapse);
            },
            // 全屏事件
            handleFullScreen() {
                let element = document.documentElement;
                if (this.fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.webkitRequestFullScreen) {
                        element.webkitRequestFullScreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.msRequestFullscreen) {
                        // IE11
                        element.msRequestFullscreen();
                    }
                }
                this.fullscreen = !this.fullscreen;
            }
        },
        mounted() {
            this.getData();
            this.name = localStorage.getItem("username");
            if (document.body.clientWidth < 1500) {
                this.collapseChage();
            }
        }
    };
</script>
<style scoped>
    .header {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 70px;
        font-size: 22px;
        color: #fff;
    }
    .collapse-btn {
        float: left;
        padding: 0 21px;
        cursor: pointer;
        line-height: 70px;
    }
    .header .logo {
        float: left;
        /*width: 250px;*/
        min-width: 250px;
        line-height: 70px;
        margin-right:20px;
    }

    /*.schema{
        float: left;
        width: 100%;
        line-height: 70px;
        cursor: pointer;

    }*/

    .header-right {
        float: right;
        padding-right: 50px;
    }
    .header-user-con {
        display: flex;
        height: 70px;
        align-items: center;
    }
    .btn-fullscreen {
        transform: rotate(45deg);
        margin-right: 5px;
        font-size: 24px;
    }
    .btn-bell,
    .btn-fullscreen {
        position: relative;
        width: 30px;
        height: 30px;
        text-align: center;
        border-radius: 15px;
        cursor: pointer;
    }
    .btn-bell-badge {
        position: absolute;
        right: 0;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background: #f56c6c;
        color: #fff;
    }
    .btn-bell .el-icon-bell {
        color: #fff;
    }
    .user-name {
        margin-left: 10px;
    }
    .user-avator {
        margin-left: 20px;
    }
    .user-avator img {
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }
    .el-dropdown-link {
        color: #fff;
        cursor: pointer;
    }
    .el-dropdown-menu__item {
        text-align: center;
    }
</style>
