<template>
    <el-dialog title="修改密码"  :visible.sync="dialogFormVisible">
        <el-form :model="form"  :rules="rules">
            <el-form-item  label="原密码" :label-width="formLabelWidth" prop="oldPassword">
                <el-input type="password" v-model="form.oldPassword"  autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item  label="新密码" :label-width="formLabelWidth" prop="newPassword">
                <el-input type="password" v-model="form.newPassword" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" :label-width="formLabelWidth" prop="confirmPassword">
                <el-input type="password" v-model="form.confirmPassword" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="ok()">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        name: "ModifyPassword",
        data(){
            //新密码和确认密码是否一致验证器
            let confirmPasswordValidate = (rule, value, callback) =>{
                if (value === '') {
                    callback(new Error('请再次输入密码'));
                } else if (value !== this.form.newPassword) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                formLabelWidth :'200px',
                dialogFormVisible : false,
                form : {
                    oldPassword:'',
                    newPassword:'',
                    confirmPassword:''
                },
                rules:{
                    oldPassword : [{required:true,message:'请输入原密码',trigger:'blur'}],
                    newPassword : [{required:true,message:'请输入新密码',trigger:'blur'}],
                    confirmPassword : [{required:true,message:'请输入确认密码',trigger:'blur'},
                        {validator:confirmPasswordValidate,trigger:'blur'}],
                }
            }
        },
        mounted:function () {
            this.oldPassword = '';
        },
        methods:{
            //修改密码确定按钮点击事件
            ok(){
                let that = this;
                //解决后台接收不到参数问题
                const params = new URLSearchParams();
                params.append("oldPassword",this.form.oldPassword);
                params.append("newPassword",this.form.newPassword);
                params.append("username",localStorage.getItem("username"));
                this.$axios.post("/user/modifyPassword",params).then(response => {
                    console.log(response.data);
                    //密码修改成功
                    if(response.data.result.resultCode==200){
                        this.$axios.get("/logout").then(response =>{
                            this.$message({
                                type:'success',
                                message:"密码修改成功，即将重新登录!",
                                onClose:()=>{
                                    localStorage.removeItem("username");
                                    this.$router.push('/login');
                                }
                            });
                        });
                    }else{
                        this.$message.error(response.data.result.message);
                    }
                }).catch(error =>{
                    console.log(error);
                    that.$message.error("密码修改失败!");
                });
            }
        }
    }
</script>

<style scoped>

</style>