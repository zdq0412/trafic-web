<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 企业管理
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
                <el-input v-model="query.name" placeholder="机构名称" class="handle-input mr10"></el-input>
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
                <el-table-column prop="code" label="机构代码"></el-table-column>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="contact" label="联系人"></el-table-column>
                <el-table-column prop="tel" label="手机号"></el-table-column>
                <el-table-column prop="addr" label="地址"></el-table-column>
                <el-table-column prop="legalPerson" label="法人"></el-table-column>
                <el-table-column prop="province" label="省"></el-table-column>
                <el-table-column prop="city" label="市"></el-table-column>
                <el-table-column prop="region" label="区"></el-table-column>
                <el-table-column prop="note" label="描述"></el-table-column>
                <el-table-column label="操作" width="120" align="center">
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @open="loadSelectData" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="代码" prop="code">
                            <el-input v-model="form.code"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="名称" prop="name">
                            <el-input v-model="form.name"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="联系人">
                            <el-input v-model="form.contact"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="手机号" prop="tel">
                            <el-input v-model="form.tel"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="地址">
                            <el-input v-model="form.addr"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="法人">
                            <el-input v-model="form.legalPerson"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="省市区">
                            <el-cascader  v-model="form.area"
                                         :options="areas"
                                          :props="{label:'name',value:'name'}"
                                         @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="企业类别">
                            <el-select v-model="form.orgCategoryId" placeholder="请选择"
                                      @change="$set(form,orgCategoryId)" style="width: 100%;" >
                                <el-option
                                        v-for="item in orgCategories"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="备注">
                            <el-input type="textarea" v-model="form.note"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%"
                  @open="loadSelectData" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="代码" prop="code">
                            <el-input v-model="form.code"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="名称" prop="name">
                            <el-input v-model="form.name"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="联系人">
                            <el-input v-model="form.contact"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="手机号" prop="tel">
                            <el-input v-model="form.tel"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="地址">
                            <el-input v-model="form.addr"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="法人">
                            <el-input v-model="form.legalPerson"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="省市区">
                            <el-cascader
                                    v-model="form.area"
                                    :options="areas"
                                    :props="{label:'name',value:'name'}"
                                    @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col>
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
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="备注">
                            <el-input type="textarea" v-model="form.note"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
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
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                orgCategories:[],
                form: {},
                areas:[],
                idx: -1,
                id: -1,
                rules:{
                    name:[{
                        required:true,message:'请输入企业名称',trigger:'blur'
                    }],
                    code:[{
                        required:true,message:'请输入企业代码',trigger:'blur'
                    }],
                    tel:[{
                        required:true,message:'请输入手机号',trigger:'blur'
                    },{
                        validator:checkTel,trigger:'blur'
                    }]
                }
            };
        },
        created() {
            this.getData();
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
                    this.form.province=this.form.area[0];
                    this.form.city=this.form.area[1];
                    this.form.region=this.form.area[2];
                }
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/org/orgsByPage",{
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
                        this.$axios.delete("/org/org/" + this.form.id).then(res => {
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
                        this.$axios.put("/org/org?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
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
                        this.$axios.post("/org/org",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
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
