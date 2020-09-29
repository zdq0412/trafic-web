<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 类别管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                        type="primary"
                        icon="el-icon-plus"
                        class="handle-del mr10"
                        @click="handleAdd"
                >新增</el-button>
                <el-button
                        type="success"
                        icon="el-icon-d-arrow-right"
                        class="handle-del mr10"
                        @click="handleImport"
                        v-loading.fullscreen.lock="fullscreenLoading"
                >导入</el-button>
                <el-button
                        type="warning"
                        icon="el-icon-download"
                        class="handle-del mr10"
                        @click="handleDownload"
                >下载导入模板</el-button>
                <el-upload style="display: none;"
                           :action="importCategoryUrl"
                           :limit="1"
                           :auto-upload="true"
                           accept=".xls,.xlsx"
                           :on-success="handleAvatarSuccess"
                           :before-upload="beforeAvatarUpload"
                           :headers="headers"
                >
                    <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
                </el-upload>
                <el-input v-model="query.name" placeholder="类别名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="id"
                    border
                    highlight-current-row
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                    @current-change="handleCurrentChange">
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column>-->
                <el-table-column prop="name" label="类别名称"></el-table-column>
                <el-table-column prop="type" label="类型"></el-table-column>
                <el-table-column prop="createDate" label="创建日期" :formatter="formatDate"></el-table-column>
                <el-table-column prop="deleted" label="状态">
                    <template slot-scope="scope">
                        <span v-if="scope.row.deleted" style="color:red;">已停用</span>
                        <span v-else>正常</span>
                    </template>
                </el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-edit"
                                @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button v-if="scope.row.deleted"
                                type="text"
                                icon="el-icon-video-play"
                                style="color:green;"
                                @click="handleDelete(scope.$index, scope.row,'play')"
                        >启用</el-button>
                        <el-button v-else
                                   type="text"
                                   icon="el-icon-video-pause"
                                   class="red"
                                   @click="handleDelete(scope.$index, scope.row,'pause')"
                        >停用</el-button>
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
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="form.type">
                        <el-option label="区域"  value="区域"></el-option>
                        <el-option label="设备档案"  value="设备档案"></el-option>
                        <el-option label="隐患排查严重程度"  value="隐患排查严重程度"></el-option>
                        <el-option label="隐患排查原因类别"  value="隐患排查原因类别"></el-option>
                        <el-option label="作业台账类别"  value="作业台账类别"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input  type="textarea"  maxlength="500" v-model="form.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="父类别">
                    <el-input v-model="form.parentName" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="form.type">
                        <el-option label="区域"  value="区域"></el-option>
                        <el-option label="设备档案"  value="设备档案"></el-option>
                        <el-option label="隐患排查严重程度"  value="隐患排查严重程度"></el-option>
                        <el-option label="隐患排查原因类别"  value="隐患排查原因类别"></el-option>
                        <el-option label="作业台账类别"  value="作业台账类别"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input  type="textarea"  maxlength="500" v-model="form.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetForm">重置</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import FunctionComponent from '../common/FunctionComponent'
    import {getDate} from "../common/utils";
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
                row:{},
                fullscreenLoading:false,
                headers:{
                    token : localStorage.getItem("token")
                },
                tableData: [],
                importCategoryUrl:'',
                delList: [],
                editVisible: false,
                addVisible: false,
                functionVisible:false,
                pageTotal: 0,
                form: {
                },
                idx: -1,
                id: -1,
                rules:{
                    name:[{required:true,message:'请输入名称',trigger:'blur'}]
                }
            };
        },
        created() {
            this.importCategoryUrl = this.$baseURL + "/category/importCategory";
            this.getData();
        },
        methods: {
            handleDownload(){
              window.location.href=this.$baseURL + "/category.xlsx"
            },
            handleAvatarSuccess(res, file) {
                if(res.result.resultCode==200){
                    this.fullscreenLoading = false;
                    this.getData();
                }else{
                    this.$message.error(res.result.message);
                }
            },
            beforeAvatarUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2;
                const isExcel1 = file.type === 'application/vnd.ms-excel';
                const isExcel2 = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                if (!isExcel1 && !isExcel2) {
                    this.$message.error("只能上传Excel文件!");
                    return false;
                }
                if (!isLt2M) {
                    this.$message.error('文件大小不能超过 2MB!');
                    return false
                }
                this.fullscreenLoading = true;
                return true;
            },
            //导入
            handleImport(){
                this.$refs.fileUploadBtn.$el.click();
            },
            resetForm(){
                this.form={};
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            formatDate(row,column,cellValue){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/category/categorysByPage",{
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
            handleDelete(index, row,operType) {
               /* this.form=row;
                this.form.operType = operType;*/

                let f = row;
                f.operType=operType;
                // 二次确认删除
                this.$confirm('确定执行该操作吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.post("/category/categoryStatus",this.$qs.stringify(f)).then(res => {
                            if(res.data.result.resultCode===200){
                                this.$message.success('操作成功');
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
                if(row.parent){
                    this.form.parentId=row.parent.id;
                    this.form.parentName=row.parent.name;
                }
            },
            handleAdd(){
                this.addVisible=true;
                this.form={};
            },
            // 查看功能
            handleFunction(index, row) {
                this.form={};
                this.idx = index;
                this.form = row;
                this.functionVisible = true;
            },
            // 点击行
            handleCurrentChange(currentRow) {
                this.row = currentRow;
                this.form.parentId=currentRow.id;
                this.form.parentName=currentRow.name;
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/category/category?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：类别名称已被使用!");
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
                        this.$axios.post("/category/category",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：类别名称已被使用!");
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
