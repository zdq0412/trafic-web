<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 目录管理
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
                <el-input v-model="query.name" placeholder="目录名称" class="handle-input mr10"></el-input>
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
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="icon" label="图标"></el-table-column>
                <el-table-column prop="schema.name" label="所属模式" ></el-table-column>
                <el-table-column prop="priority" label="优先级" ></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-share"
                                class="lightYellow"
                                @click="handleFunction(scope.$index, scope.row)"
                        >菜单</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%"
                   @open="loadSchema" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="图标">
                    <el-input v-model="form.icon"></el-input>
                </el-form-item>
                <el-form-item label="所属模式">
                    <el-select v-model="form.schemaId" placeholder="请选择">
                        <el-option
                                v-for="item in schemas"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-input-number v-model="form.priority"  maxlength="10" ></el-input-number>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500"  type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"
                  @open="loadSchema" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="图标">
                    <el-input v-model="form.icon"></el-input>
                </el-form-item>
                <el-form-item label="所属模式">
                    <el-select v-model="form.schemaId" placeholder="请选择">
                        <el-option
                                v-for="item in schemas"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-input-number v-model="form.priority"  maxlength="10" ></el-input-number>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500"  type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增授权对话框 -->
        <el-dialog title="授权" :visible.sync="grantFunctionVisible" width="30%">
            <div style="height:500px;overflow: auto;">
                <function-tree ref="functionTree" v-if="grantFunctionVisible" :paramType="param" :param="dirId"></function-tree>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="grantFunctionVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveFunctions">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import FunctionTree from "../common/FunctionTree"
    export default {
        components:{
            FunctionTree
        },
        name: 'basetable',
        data() {
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                dirId:'',
                param:'directory',
                tableData: [],
                schemas:[],
                delList: [],
                editVisible: false,
                addVisible: false,
                grantFunctionVisible:false,
                pageTotal: 0,
                form: {
                },
                idx: -1,
                id: -1,
                rules:{
                    name:[{
                        required:true,message:'请输入目录名称',trgger:'blur'
                    }]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            //保存权限
            saveFunctions(){
                let checkedIds = this.$refs.functionTree.getCheckedKeys();
                let param = new FormData();
                param.append("functionsId",JSON.stringify(checkedIds));
                param.append("dirId",this.dirId);
                this.$axios.put("functions/directoryFunctions",param).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.grantFunctionVisible = false;
                        this.$message.success("授权成功!");
                    }
                }).catch(error=>{
                    console.log(error);
                });
                console.log(checkedIds);
            },
            loadSchema(){
                this.$axios.get("/schema/schemas").then(res=>{
                    this.schemas=res.data.data;
                }).catch(error=>{
                    console.log(error);
                });
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/directory/directorysByPage",{
                    params:{
                        name:this.query.name,
                        page:this.query.pageIndex,
                        limit:this.query.pageSize
                    }
                }).then(res => {
                    this.tableData = res.data.data;
                    this.pageTotal = res.data.count;
                }).catch(error => {
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
                        this.$axios.delete("/directory/directory/" + this.form.id).then(res => {
                            this.$message.success('删除成功');
                            this.getData();
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
                this.form.schemaId=row.schema.id;
            },
            // 授权操作
            handleFunction(index, row) {
                this.idx = index;
                this.grantFunctionVisible = true;
                this.dirId=row.id;
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/directory/directory?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：目录名称已被使用!");
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
                        this.$axios.post("/directory/directory",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：目录名称已被使用!");
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
