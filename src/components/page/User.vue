<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 用户管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                        type="primary"
                        icon="el-icon-plus"
                        class="handle-del mr10"
                        @click="addVisible=true;form={};"
                >新增</el-button>
                <el-input v-model="query.username" placeholder="用户名" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    ref="multipleTable"
                    header-cell-class-name="table-header"
            >
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column>-->
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="role.name" label="角色"></el-table-column>
                <el-table-column prop="realname" label="真名"></el-table-column>
                <el-table-column prop="tel" label="手机号"></el-table-column>
                <el-table-column prop="allowedDelete" label="允许删除" :formatter="formatBoolean"></el-table-column>
                <el-table-column prop="org.name" label="所在企业"></el-table-column>
                <el-table-column prop="status" label="状态" :formatter="formatStatus" >
                    <!--<template slot-scope="scope">
                        <el-switch
                                v-model="status"
                                active-text="正常"
                                inactive-text="禁用">
                        </el-switch>
                    </template>-->
                </el-table-column>
                <el-table-column label="操作" width="230" align="center">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.status=='0' && scope.row.allowedDelete==true"
                                   type="text"
                                   icon="el-icon-reset"
                                   class="gray"
                                   @click="disabledUser(scope.$index, scope.row)"
                        >禁用</el-button>
                        <el-button v-if="scope.row.status=='1' && scope.row.allowedDelete==true"
                                   type="text"
                                   icon="el-icon-reset"
                                   class="green"
                                   @click="enabledUser(scope.$index, scope.row)"
                        >启用</el-button>
                        <el-button
                                type="text"
                                icon="el-icon-reset"
                                class="lightYellow"
                                @click="resetPassword(scope.$index, scope.row)"
                        >密码重置</el-button>
                        <el-button
                                type="text"
                                icon="el-icon-edit"
                                @click="handleEdit(scope.$index, scope.row)"
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
            <div class="pagination">
                <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :current-page="query.pageIndex"
                        :page-size="query.pageSize"
                        :total="pageTotal"
                        @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" maxlength="15"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="所属角色" >
                    <el-select v-model="form.roleId" @change="$set(form,roleId)">
                        <el-option v-for="item in roles"
                                   :key="item.id"
                                   :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="真名">
                    <el-input v-model="form.realname" maxlength="10"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="tel">
                    <el-input v-model="form.tel"></el-input>
                </el-form-item>
                <el-form-item label="所在企业">
                    <el-select v-model="form.orgId" @change="$set(form,orgId)">
                        <el-option
                                v-for="item in orgs"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" maxlength="15"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="form.roleId" @change="$set(form,roleId)">
                        <el-option v-for="item in roles"
                                   :key="item.id"
                                   :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="真名">
                    <el-input v-model="form.realname" maxlength="10"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="tel">
                    <el-input v-model="form.tel"></el-input>
                </el-form-item>
                <el-form-item label="所在企业">
                    <el-select v-model="form.orgId" @change="$set(form,orgId)">
                        <el-option
                                v-for="item in orgs"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'basetable',
        data() {
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
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                value :'',
                roleId:'',
                orgId:'',
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,
                status:false,
                orgs:[],
                roles:[],
                rules:{
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    tel: [
                        { required: true, message: '请输入手机号码', trigger: 'blur' },
                        {
                            validator:checkTel,trigger:'blur'
                        }
                    ]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            disabledUser(index,row){
                  this.$axios.get("/user/enableOrDisableUser",{
                      params:{
                          id:row.id,
                          status:"0"
                      }
                  }).then(res=>{
                      this.getData();
                      this.$message.success("已禁用!");
                  }).catch(error=>{
                      console.log(error);
                  })
            },
            enabledUser(index,row){
                  this.$axios.get("/user/enableOrDisableUser",{
                      params:{
                          id:row.id,
                          status:"1"
                      }
                  }).then(res=>{
                      this.getData();
                      this.$message.success("已启用!");
                  }).catch(error=>{
                      console.log(error);
                  })
            },
            formatBoolean(row,column,cellValue){
                if(cellValue){
                    return '是';
                }else{
                    return '否';
                }
            },
            formatStatus(row,column,cellValue){
                if(cellValue=='0'){
                    return '正常';
                }
                if(cellValue=='1'){
                    // return "<template style='color:red;'>禁用</template>";
                    return "禁用";
                }
            },
            //加载角色和企业信息
            loadSelectData(){
                this.$axios.get("/role/roles").then(res => {
                    this.roles = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
                this.$axios.get("/org/orgs").then(res => {
                    this.orgs = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            resetPassword(index, row){
                this.$axios.get("/user/resetPassword",{
                    params:{
                        username : row.username
                    }
                }).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.$message.success("密码已修改!");
                    }else{
                        this.$message.error(res.data.result.message);
                    }
                }).catch(error=>{
                    console.log(error);
                });
            },
            getData() {
                this.$axios.get("/user/usersByPage",{
                    params:{
                        page:this.query.pageIndex,
                        limit:this.query.pageSize,
                        name : this.query.username
                    }
                }).then(res => {
                    this.tableData = res.data.data;
                    this.pageTotal = res.data.count;
                }).catch(error=>{
                    console.log(error);
                });
            },
            // 触发搜索按钮
            handleSearch() {
                this.$set(this.query, 'pageIndex', 1);
                this.getData();
            },
            // 删除操作
            handleDelete(index, row) {
                this.form=row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/user/user/" + this.form.id).then(res => {
                            if(res.data.result.resultCode==200){
                                this.$message.success('删除成功');
                                this.getData();
                            }else{
                                this.$message.error(res.data.result.message);
                            }
                        }) .catch(error =>{
                            console.log(error);
                        });
                    })
                    .catch(() => {});
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editVisible = true;
                if(row.role){
                    this.form.roleId=row.role.id;
                }
                if(row.org){
                    this.form.orgId=row.org.id;
                }
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/user/user?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：用户名称已被使用!");
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        return false;
                    }
                });
            },
            // 保存新增
            saveAdd(){
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.$axios.post("/user/user",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：用户名称已被使用!");
                            }
                        }).catch(err =>{
                            console.log(err);
                        });
                    }else{
                        return false;
                    }
                });
            },
            // 分页导航
            handlePageChange(val) {
                this.$set(this.query, 'pageIndex', val);
                this.getData();
            }
        }
    };
</script>
<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
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
    .table-td-thumb {
        display: block;
        margin: auto;
        width: 40px;
        height: 40px;
    }
    .lightYellow {
        color: #FF9900;
    }
    .green{
        color:green;
    }
    .gray{
        color:#909399;
    }
</style>
