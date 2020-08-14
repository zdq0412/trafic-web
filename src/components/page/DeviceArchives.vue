<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 设备档案
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
                <el-input v-model="query.name" placeholder="人员名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    header-cell-class-name="table-header"
            >
                <el-table-column prop="equipmentCode" label="编码"></el-table-column>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="specification" label="规格型号"></el-table-column>
                <el-table-column prop="price" label="单价"></el-table-column>
                <el-table-column prop="category.name" label="类别"></el-table-column>
                <el-table-column prop="buyDate" label="购置日期" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="manufacturer" label="厂商"></el-table-column>
                <el-table-column prop="position" label="放置位置"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="保养维修记录">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row)"
                        >查看</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="230" fixed="right" align="center">
                    <template slot-scope="scope">
                        <el-upload style="display: none;"
                                   :action="uploadUrl"
                                   :limit="1"
                                   :auto-upload="true"
                                   ref="uploadFile"
                                   :data="param"
                                   :accept="ext"
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="编码">
                    <el-input v-model="form.equipmentCode"></el-input>
                </el-form-item>
                <el-form-item label="设备类别">
                    <el-select   v-model="form.categoryId" placeholder="请选择">
                        <el-option
                                v-for="item in categorys"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select >
                </el-form-item>
                <el-form-item label="规格型号">
                    <el-input v-model="form.specification"></el-input>
                </el-form-item>
                <el-form-item label="单价(元)">
                    <el-input-number v-model="form.price"></el-input-number>
                </el-form-item>
                <el-form-item label="购置日期" >
                    <el-date-picker
                            v-model="form.buyDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="厂商">
                    <el-input  v-model="form.manufacturer"></el-input>
                </el-form-item>
                <el-form-item label="放置位置">
                    <el-input  v-model="form.position"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="form.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="编码">
                    <el-input v-model="form.equipmentCode"></el-input>
                </el-form-item>
                <el-form-item label="设备类别">
                    <el-select   v-model="form.categoryId" placeholder="请选择">
                        <el-option
                                v-for="item in categorys"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select >
                </el-form-item>
                <el-form-item label="规格型号">
                    <el-input v-model="form.specification"></el-input>
                </el-form-item>
                <el-form-item label="单价(元)">
                    <el-input-number v-model="form.price"></el-input-number>
                </el-form-item>
                <el-form-item label="购置日期" >
                    <el-date-picker
                            v-model="form.buyDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="厂商">
                    <el-input  v-model="form.manufacturer"></el-input>
                </el-form-item>
                <el-form-item label="放置位置">
                    <el-input  v-model="form.position"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="form.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetForm">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {getDate} from "../common/utils";
    export default {
        name: 'basetable',
        data() {
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                categorys:[],
                uploadUrl:'',
                param:{type:'device'},
                headers:{
                    token : localStorage.getItem("token")
                },
                ext:'.doc,.docx,.jpg,.jpeg,.bmp,.rar,.zip,.png,.pdf',

                baseUrl:'',
                tableData: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,
                rules:{
                    name: [
                        { required: true, message: '请输入设备名称', trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.baseUrl = this.$baseURL;
            this.uploadUrl = this.$baseURL + "/employeeDocumentUpload";
            this.getData();
        },
        methods: {
            lookup(index, row) {
                this.$router.push({name:"deviceMaintain",params:{deviceId:row.id}});
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
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
                const isJPG = file.type === 'image/jpeg';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';
                const isWord = (file.type === 'application/msword' || file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                const isPdf = file.type==='application/pdf';
                const isRar = (file.type==='application/octet-stream' || file.type==='');
                const isZip = file.type==='application/x-zip-compressed';
                if(!isJPG && !isPNG && !isBMP && !isWord && !isPdf && !isRar && !isZip){
                    this.$message.error('上传文件支持的类型：jpg、png、bmp、doc、docx、pdf、rar、zip!');
                    return false;
                }
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false
                }
                return  true;
            },
            //加载下拉选择数据
            loadSelectData() {
                this.$axios.get("/category/categorys",{
                    params:{
                        type:'设备档案'
                    }
                }).then(res => {
                    this.categorys = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            getData() {
                this.$axios.get("/device/devicesByPage", {
                    params: {
                        page: this.query.pageIndex,
                        limit: this.query.pageSize,
                        name: this.query.name
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
                this.form = row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/device/device/" + this.form.id).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.$message.success('删除成功');
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(error => {
                            console.log(error);
                        });
                    })
                    .catch(() => {
                    });
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editVisible = true;
                if(row.buyDate){
                    this.form.buyDate = getDate(new Date(row.buyDate));
                }

                if(row.category){
                    this.form.categoryId=row.category.id;
                }
            },
            handleAdd(){
                this.addVisible = true;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                this.form = {};
            },
            // 保存编辑
            saveEdit() {
                if(this.departmentIds && this.departmentIds.length>0){
                    this.form.departmentId=this.departmentIds[this.departmentIds.length-1];
                }
                this.$refs.form.validate(validate => {
                    if (validate) {
                        if(this.isSelectFile) {
                            this.$refs.upload_edit.submit();
                        }else{
                            this.$axios.post("/device/updateDeviceNoPhoto",this.$qs.stringify(this.form)).then(res=>{
                                this.editVisible= false;
                                this.getData();
                                this.isSelectFile = false;
                            }).catch(error=>{
                                console.log(error);
                            });
                        }
                    } else {
                        return false;
                    }
                });
            },
            resetForm() {
                this.addVisible = false;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
            },
            // 保存新增
            saveAdd() {
                if(this.departmentIds && this.departmentIds.length>0){
                    this.form.departmentId=this.departmentIds[this.departmentIds.length-1];
                }
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.post("/device/addDeviceNoPhoto",this.$qs.stringify(this.form)).then(res=>{
                            this.addVisible= false;
                            this.getData();
                        }).catch(error=>{
                            console.log(error);
                        });
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
    .avatar-uploader ,.el-upload{
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        width:100px;
        height:100px;
    }
    .avatar-uploader:hover,.el-upload:hover {
        border-color: #409EFF;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
    .table-td-thumb {
        display: block;
        margin: auto;
        width: 40px;
        height: 40px;
    }
    .avatar{
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
</style>
