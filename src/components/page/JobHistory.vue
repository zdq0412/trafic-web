<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 工作经历管理
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
                    class="table"
                    header-cell-class-name="table-header"
            >
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="createDate" label="创建时间" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="280" align="center">
                    <template slot-scope="scope">
                        <el-upload style="display: none;"
                                   :action="uploadUrl"
                                   :limit="1"
                                   :auto-upload="true"
                                   ref="uploadFile"
                                   :data="param"
                                   accept=".doc,.docx"
                                   :on-success="handleAvatarSuccess"
                                   :before-upload="beforeAvatarUpload"
                                   :headers="headers">
                            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
                        </el-upload>
                        <el-button
                                type="text"
                                icon="el-icon-upload2"
                                class="upload"
                                @click="upload(scope.$index, scope.row)"
                        >上传</el-button>
                        <el-button v-if="scope.row.realPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="download(scope.$index, scope.row)"
                        >下载</el-button>
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
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"  @close="closeDialog">
            <el-form ref="form" :model="form" :rules="rules"  label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                    <el-input v-model="form.id" v-show="false"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {getDateTime} from "../common/utils";

    export default {
        name: 'basetable',
        data() {
            return {
                query: {
                    pageIndex: 1,
                    pageSize: 10
                },

                uploadUrl:'',
                param:{type:'jobHistory'},
                headers:{
                    token : localStorage.getItem("token")
                },

                tableData: [],
                delList: [],
                empId:'',
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                form: {
                },
                idx: -1,
                id: -1,
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.empId = this.$route.params.empId;
            this.uploadUrl = this.$baseURL + "/employeeDocumentUpload";
            this.getData();
        },
        methods: {
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDateTime(new Date(cellValue));
                }else{
                    return '';
                }
            },
            upload(index,row){
                this.$refs.uploadFile.clearFiles();
                this.param.id=row.id;
                this.$refs.fileUploadBtn.$el.click();
            },
            download(index,row){
                window.location.href=this.$baseURL + "/" + row.url;
            },
            handleAvatarSuccess(res, file) {
                this.$message.success("上传成功!");
                this.getData();
            },
            beforeAvatarUpload(file) {
                const isLt5M = file.size / 1024 / 1024 < 5;
                //const isWord = (file.type==='application/msword' || file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false
                }
                /*if(!isWord){
                    this.$message.error('只能上传work文档!');
                    return false;
                }*/
                return  isLt5M;
               // return  isWord&isLt5M;
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/jobHistory/jobHistorysByPage",{
                    params:{
                        page:this.query.pageIndex,
                        limit:this.query.pageSize,
                        empId:this.empId
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
            },
            // 删除操作
            handleDelete(index, row) {
                this.form=row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/jobHistory/jobHistory/" + this.form.id).then(res => {
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
                    if (validate) {
                        this.form.empId=this.empId;
                        this.$axios.put("/jobHistory/jobHistory?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
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
                        this.form.empId = this.empId;
                        this.$axios.post("/jobHistory/jobHistory",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
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
    @import "../../assets/css/common.css";
    .handle-box {
        margin-bottom: 20px;
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
</style>
