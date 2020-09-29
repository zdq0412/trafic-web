<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 风险等级
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
            </div>
            <el-table
                    :data="tableData"
                    border
                    stripe
                    class="table"
                    :cell-style="fourColorBg"
                    header-cell-class-name="table-header"
            >
                <el-table-column
                        label="序号"
                        type="index"
                        width="50"
                        align="center">
                    <template scope="scope">
                        <span>{{(query.pageIndex - 1) * query.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="风险等级名称"></el-table-column>
                <el-table-column prop="color" label="颜色">
                    <template slot-scope="scope">
                        <span></span>
                    </template>
                </el-table-column>
                <el-table-column prop="upperLimit" label="范围上限"></el-table-column>
                <el-table-column prop="lowerLimit" label="范围下限"></el-table-column>
                <el-table-column prop="measure" label="控制措施"></el-table-column>
                <el-table-column prop="timeLimit" label="实施期限"></el-table-column>
               <!-- <el-table-column prop="measure" label="控制措施"></el-table-column>
                <el-table-column prop="timeLimit" label="实施期限"></el-table-column>-->
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="风险等级名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="颜色" prop="color">
                    <el-color-picker v-model="form.color"></el-color-picker>
                </el-form-item>
                <el-form-item label="范围上限" prop="upperLimit">
                    <el-input-number v-model="form.upperLimit" :max="25" :min="1" :step="1" :precision="0"></el-input-number>
                </el-form-item>
                <el-form-item label="范围下限" prop="lowerLimit">
                    <el-input-number v-model="form.lowerLimit" :max="20" :min="1" :step="1" :precision="0"></el-input-number>
                </el-form-item>
                <!--<el-form-item label="控制措施" prop="measure">
                    <el-input v-model="form.measure"  maxlength="500"  type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="实施期限" prop="timeLimit">
                    <el-input v-model="form.timeLimit"  maxlength="500"  type="textarea"></el-input>
                </el-form-item>-->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%"  @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="风险等级名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="颜色" prop="color">
                    <el-color-picker v-model="form.color"></el-color-picker>
                </el-form-item>
                <el-form-item label="范围上限" prop="upperLimit">
                    <el-input-number v-model="form.upperLimit" :max="25" :min="1" :step="1" :precision="0"></el-input-number>
                </el-form-item>
                <el-form-item label="范围下限" prop="lowerLimit">
                    <el-input-number v-model="form.lowerLimit" :max="20" :min="1" :step="1" :precision="0"></el-input-number>
                </el-form-item>
                <!--<el-form-item label="控制措施">
                    <el-input v-model="form.measure"  maxlength="500"  type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="实施期限">
                    <el-input v-model="form.timeLimit"  maxlength="500"  type="textarea"></el-input>
                </el-form-item>-->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'dashboard',
        data() {
            return {
                rules:{
                    name:[{
                        required:true,message:'请输入风险等级名称',trigger:'blur'
                    }],
                    color:[{required:true,message:'请选择风险等级颜色',trigger:'blur'}],
                    lowerLimit:[{required:true,message:'请输入风险值下限',trigger:'blur'}],
                    upperLimit:[{required:true,message:'请输入风险值上限',trigger:'blur'}]
                },
                query: {
                    pageIndex: 1,
                    pageSize: 10
                },
                pageTotal: 0,
                tableData: [],
                addVisible:false,
                editVisible:false,
                form:{},
                idx:-1
            };
        },
        created(){
            this.getData();
        },
        methods: {
            handleAdd(){
                this.addVisible=true;
                this.$refs["form"].clearValidate();
                this.form = {};
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
                this.form = {};
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/riskLevel/riskLevelsByPage",{
                    params:{
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
            cancelAdd(){
                this.addVisible=false;
                this.$refs["form"].clearValidate();
                this.form = {};
            },
            // 删除操作
            handleDelete(index, row) {
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/riskLevel/riskLevel/" + row.id).then(res => {
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
                this.$refs["form"].clearValidate();
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    console.log(this.form);
                    if (validate) {
                        this.$axios.put("/riskLevel/riskLevel?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/riskLevel/riskLevel",this.$qs.stringify(this.form)).then(res=>{
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
            },
            fourColorBg(obj){
                if(obj.columnIndex==2){
                    return 'backgroundColor:' + obj.row.color;
                }
                return '';
            }
        }
    };
</script>


<style scoped>
    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list span {
        margin-left: 70px;
    }

    .table {
        width: 100%;
        font-size: 14px;
    }
    .handle-box {
        margin-bottom: 20px;
    }
    .red {
        color: #ff0000;
    }
    .mr10 {
        margin-right: 10px;
    }
</style>
