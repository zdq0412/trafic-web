<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 权限管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                        type="primary"
                        icon="el-icon-plus"
                        class="handle-del mr10"
                        @click="handleAdd()"
                >新增</el-button>
               <el-input v-model="query.name" placeholder="权限名" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="id"
                    border
                    lazy
                    highlight-current-row
                    unique-opened
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                    @current-change="handleCurrentChange"
            >
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column>-->
                <el-table-column prop="name" label="权限名"></el-table-column>
                <el-table-column prop="icon" label="图标"></el-table-column>
                <el-table-column prop="index" label="访问路径"></el-table-column>
                <el-table-column prop="priority" label="优先级"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-share"
                                class="lightYellow"
                                @click="handleFunction(scope.$index, scope.row)"
                        >功能</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @close="closeDialog">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="图标">
                    <el-input v-model="form.icon"></el-input>
                </el-form-item>
                <el-form-item label="路径">
                    <el-input v-model="form.index"></el-input>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-input-number v-model="form.priority"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增"  :visible.sync="addVisible" width="30%" @close="closeDialog">
            <el-form ref="form"  :rules="rules" :model="form" label-width="70px">
                <el-form-item label="父菜单" prop="parentName">
                    <el-input v-model="form.parentName" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="图标">
                    <el-input v-model="form.icon"></el-input>
                </el-form-item>
                <el-form-item label="路径">
                    <el-input v-model="form.index"></el-input>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-input-number v-model="form.priority"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="addFunction">确 定</el-button>
            </span>
        </el-dialog>
        <!--查看菜单功能对话框-->
        <el-dialog title="功能" :visible.sync="functionVisible" width="80%" append-to-body>
            <div style="height:100%;overflow: auto;">
                <function-component :menuId="menuId"></function-component>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="functionVisible = false">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import FunctionComponent from '../common/FunctionComponent'
    export default {
        components:{
            FunctionComponent
        },
        name: 'basetable',
        data() {
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                value :'',
                type:'',
                menuId:'',
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                functionVisible:false,
                pageTotal: 0,
                row:{},
                form: {
                },
                idx: -1,
                id: -1,
                rules:{
                    parentName: [
                        { required: true, message: '请选择父权限', trigger: 'blur' }
                    ],
                    name:[
                        { required: true, message: '请输入权限名称', trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/functions/menusByPage",{
                    params:{
                        page:this.query.pageIndex,
                        limit:this.query.pageSize,
                        name : this.query.name
                    }
                }).then(res =>{
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
                if(!row.type){
                    this.$message.error("只允许删除二级菜单!");
                    return false;
                }
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/functions/function/" + row.id).then(res=>{
                            this.$message.success('删除成功');
                            this.getData();
                        }).catch(error=>{
                            console.log(error);
                        })
                    })
                    .catch(() => {});
            },
            // 点击行
            handleCurrentChange(currentRow) {
                this.row = currentRow;
            },
            handleAdd(){
                if(!this.row.id){
                    this.$message.error("请选择父菜单!");
                    return false;
                }

                if(this.row.type){
                    this.$message.error("请选择一级菜单!");
                    return false;
                }
                this.addVisible=true;
                this.form.parentId=this.row.id;
                this.form.parentName=this.row.name;
                this.form.parentType=this.row.type;
                this.form.type='1';
            },
            //添加权限
            addFunction(){
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.$axios.post("/functions/function",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：权限名称已被使用!");
                            }
                        }).catch(err =>{
                            console.log(err);
                        });
                    }else{
                        return false;
                    }
                });
            },
            // 编辑操作
            handleEdit(index, row) {
                if(!row.type){
                    this.$message.error("一级菜单不允许编辑!");
                    return false;
                }
                this.idx = index;
                this.form = row;
                this.editVisible = true;
            },
            // 查看功能
            handleFunction(index, row) {
                if(!row.type){
                    this.$message.error("一级菜单不允许该操作 !");
                    return false;
                }
                this.menuId=row.id;
                this.idx = index;
                this.form = row;
                this.functionVisible = true;
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    let formData = new FormData();
                    formData.append("id",this.form.id);
                    formData.append("name",this.form.name);
                    formData.append("index",this.form.index);
                    formData.append("icon",this.form.icon);
                    formData.append("priority",this.form.priority);
                    if (validate) {
                        this.$axios.put("/functions/function" , formData).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：权限名称已被使用!");
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
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
    .lightYellow {
        color: #FF9900;
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
</style>
