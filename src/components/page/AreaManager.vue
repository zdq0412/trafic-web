<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 区域管理员
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                        type="primary"
                        icon="el-icon-plus"
                        class="handle-del mr10"
                        @click="addVisible=true"
                >新增</el-button>
                <el-input v-model="query.name" placeholder="用户名" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    ref="multipleTable"
                    header-cell-class-name="table-header"
            >
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="province" label="省"></el-table-column>
                <el-table-column prop="city" label="市"></el-table-column>
                <el-table-column prop="region" label="区"></el-table-column>
                <el-table-column prop="orgCategory.name" label="企业类别"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @open="loadSelectData" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="省市区">
                    <el-cascader style="width: 100%;"
                                 v-model="form.area"
                                 :options="areas"
                                 :props="{label:'name',value:'name'}"
                                 @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="企业类别">
                    <el-select v-model="form.orgCategoryId" placeholder="请选择" style="width: 100%;" @change="$set(form)">
                        <el-option
                                v-for="item in orgCategories"
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
        <el-dialog title="新增" :visible.sync="addVisible" width="30%" @open="loadSelectData" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" ></el-input>
                </el-form-item>
                <el-form-item label="省市区">
                    <el-cascader style="width: 100%;"
                                 v-model="form.area"
                                 :options="areas"
                                 :props="{label:'name',value:'name'}"
                                 @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="企业类别">
                    <el-select v-model="form.orgCategoryId" placeholder="请选择" style="width: 100%;" >
                        <el-option
                                v-for="item in orgCategories"
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
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                tableData: [],
                areas:[],
                orgCategories:[],
                delList: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                form: {
                },
                idx: -1,
                id: -1,
                rules:{
                    username:[{
                        required:true,message:'请输入名称',trigger:'blur'
                    }]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            handleChange(){
                if(this.form.area&&this.form.area.length>0){
                    this.form.province=this.form.area[0];
                    this.form.city=this.form.area[1];
                    this.form.region=this.form.area[2];
                }
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            loadSelectData(){
                this.$axios.get("/orgCategory/orgCategorys").then(res => {
                    this.orgCategories = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
                this.$axios.get("/category/categorys").then(res => {
                    this.areas = res.data.data;
                }).catch(error => {
                    console.log(error);
                });

            },
            getData() {
                this.$axios.get("/areaManager/areaManagersByPage",{
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
                        this.$axios.delete("/areaManager/areaManager/" + this.form.id).then(res => {
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
                if(row.orgCategory){
                    this.form.orgCategoryId = row.orgCategory.id;
                }
                this.form.area=[row.province,row.city,row.region];
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/areaManager/areaManager?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：区域管理员名称已被使用!");
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
                        this.$axios.post("/areaManager/areaManager",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：区域管理员名称已被使用!");
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
</style>
