<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 角色管理
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
                <el-input v-model="query.name" placeholder="角色名称" class="handle-input mr10"></el-input>
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
                <el-table-column prop="createDate" label="创建日期" :formatter="formatDate"></el-table-column>
                <el-table-column prop="orgCategory.name" label="企业类别"></el-table-column>
                <el-table-column prop="allowedDelete" label="允许删除" :formatter="formatBoolean"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-share"
                                class="lightYellow"
                                @click="handleFunction(scope.$index, scope.row)"
                        >授权</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @open="loadOrgCategory">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="企业类别"  v-if="!haveOrg">
                    <el-select v-model="form.orgCategoryId" placeholder="请选择" @change="$set(form,orgCategoryId)">
                        <el-option
                                v-for="item in orgCategories"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%" @open="loadOrgCategory">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="企业类别" v-if="!haveOrg">
                    <el-select v-model="form.orgCategoryId" placeholder="请选择">
                        <el-option
                                v-for="item in orgCategories"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增授权对话框 -->
        <el-dialog title="授权" :visible.sync="grantFunctionVisible" width="40%">
            <el-checkbox v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <div style="height:500px;overflow: auto;">
                <function-tree ref="functionTree" v-if="grantFunctionVisible" :paramType="param" :param="roleId"></function-tree>
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
    import {getDate} from "../common/utils";
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
                param:'role',
                checkAll:false,
                haveOrg:false,
                org:{},
                roleId:'',
                orgCategoryId:'',
                tableData: [],
                orgCategories: [],
                editVisible: false,
                addVisible: false,
                grantFunctionVisible:false,
                pageTotal: 0,
                form: {
                    orgCategoryId:''
                },
                idx: -1,
                id: -1,
                rules:{
                    name:[{required:true,message:'请输入角色名称',trigger:'blur'}]
                }
            };
        },
        created() {
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.haveOrg = true;
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
            this.getData();
        },
        methods: {
            handleCheckAllChange(val) {
                if (this.checkAll) {
                    this.$refs.functionTree.$refs.tree.setCheckedNodes(this.$refs.functionTree.functions);
                } else {
                    this.$refs.functionTree.$refs.tree.setCheckedKeys([]);
                }
            },
            //保存权限
            saveFunctions(){
                let checkedIds = this.$refs.functionTree.getCheckedKeys();
                let param = new FormData();
                param.append("functionsId",JSON.stringify(checkedIds));
                param.append("roleId",this.roleId);
                this.$axios.put("functions/roleFunctions",param).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.grantFunctionVisible = false;
                        this.$message.success("授权成功!");
                    }
                }).catch(error=>{
                    console.log(error);
                });
                console.log(checkedIds);
            },
            loadOrgCategory(){
                this.$axios.get("/orgCategory/orgCategorys").then(res => {
                    this.orgCategories = res.data.data;
                }).catch(error => {
                    console.log(error);
                })
            },
            formatDate(row,column,cellValue){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            formatBoolean(row,column,cellValue){
                if(cellValue){
                    return '是';
                }else{
                    return '否';
                }
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/role/rolesByPage",{
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
                        this.$axios.delete("/role/role/" + this.form.id).then(res => {
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
                this.form.orgCategoryId=row.orgCategory.id;
            },
            // 授权操作
            handleFunction(index, row) {
                this.idx = index;
                this.grantFunctionVisible = true;
                this.roleId=row.id;
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/role/role?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：角色名称已被使用!");
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
                        this.$axios.post("/role/role",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：角色名称已被使用!");
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
