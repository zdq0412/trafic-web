<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover" style="height:500px;">
                    <div slot="header" class="clearfix">
                        <span style="font-weight: bold;">危险源辨识与控制</span>
                    </div>
                    <div slot="header"  style="margin-top:20px;">
                        <span>危险源辨识方法：R（风险值）＝L（可能性）×S（严重性）</span>
                    </div>
                    <div style="width:100%;text-align: center;margin-top:-15px;margin-bottom:5px;">
                        <span>安全风险等级判定准则（R）及控制措施</span>
                    </div>
                    <el-table
                            :data="riskSourcesData"
                            border
                            stripe
                            style="width: 100%"
                            :cell-style="cellStyle">
                        <el-table-column
                                prop="col0"
                                label="风险值"
                        >
                        </el-table-column>
                        <el-table-column
                                prop="col1"
                                label="风险等级"
                        >
                        </el-table-column>
                        <el-table-column
                                prop="col2"
                                label="应采取的行动/控制措施"
                                width="190">
                        </el-table-column>
                        <el-table-column
                                prop="col3"
                                label="实施期限"
                        >
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover" style="height:500px;">
                    <div slot="header" class="clearfix">
                        <span style="font-weight: bold;">危险源辨识与控制</span>
                    </div>
                    <div slot="header"  style="margin-top:20px;">
                        <span>厂区安全风险空间分布四色图</span>
                        <el-button style="float: right; padding: 3px 0px"
                                   type="text" @click="helpDialog=true">查看帮助</el-button>

                        <el-dialog title="帮助" :visible.sync="helpDialog" width="30%">
                            <el-card shadow="hover" style="height:500px;">
                                <div slot="header" class="clearfix">
                                    <span style="font-weight: bold;">帮助</span>
                                    <el-button style="float: right; padding: 3px 10px" type="text"
                                               @click="download">下载到本地</el-button>
                                </div>
                            </el-card>
                            <span slot="footer" class="dialog-footer">
                                <el-button @click="helpDialog = false">确定</el-button>
                            </span>
                        </el-dialog>
                        <el-upload
                                style="display: none;"
                                :action="uploadUrl"
                                :limit="1"
                                :auto-upload="true"
                                accept=".jpeg,.png,.bmp,.jpg,.JPEG,.PNG,.BMP,.JPG"
                                :on-success="handleAvatarSuccess"
                                :before-upload="beforeAvatarUpload"
                                :headers="headers"
                        >
                            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">点击上传</el-button>
                        </el-upload>
                        <el-button style="float: right; padding: 3px 10px" type="text"
                                   @click="handleUpload">上传</el-button>
                    </div>
                    <img alt="厂区安全风险空间分布四色图"
                         style="width:100%;height:400px;margin-top: -10px;"
                         :src="fourColorPic"/>
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-card shadow="hover" style="height:403px;">
                    <div slot="header" class="clearfix">
                        <span>危险源清单</span>
                        <el-button style="float: right; padding: 3px 0" type="text" @click="handleAdd">添加</el-button>
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
                        <el-table-column prop="name" label="危险源名称"></el-table-column>
                        <el-table-column prop="happen" label="发生可能性(L)"></el-table-column>
                        <el-table-column prop="consequence" label="后果严重性(S)"></el-table-column>
                        <el-table-column prop="criterion" label="判定准则(R)"></el-table-column>
                        <el-table-column prop="riskLevel" label="安全风险等级"></el-table-column>
                        <el-table-column prop="fourColor" label="四色标识">
                           <template slot-scope="scope">
                                <span ></span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="measures" label="应采取的行动/控制措施"></el-table-column>
                        <el-table-column prop="timeLimit" label="实施期限"></el-table-column>
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
                    <!-- 编辑弹出框 -->
                    <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @close="closeDialog">
                        <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="form.name" maxlength="50"
                                          show-word-limit></el-input>
                            </el-form-item>
                            <el-form-item label="发生可能性" prop="happen">
                                <el-input-number v-model="form.happen" number></el-input-number>
                            </el-form-item>
                            <el-form-item label="后果严重性" prop="consequence">
                                <el-input-number v-model="form.consequence" number></el-input-number>
                            </el-form-item>
                            <el-form-item label="判定准则" prop="criterion">
                                <el-input-number v-model="form.criterion" number></el-input-number>
                            </el-form-item>
                            <el-form-item label="风险等级" prop="riskLevel">
                                <el-input v-model="form.riskLevel"></el-input>
                            </el-form-item>
                            <el-form-item label="四色标识" prop="fourColor">
                                <el-color-picker v-model="form.fourColor"></el-color-picker>
                            </el-form-item>
                            <el-form-item label="控制措施" prop="measures">
                                <el-input v-model="form.measures" type="textarea"></el-input>
                            </el-form-item>
                            <el-form-item label="实施期限" prop="timeLimit">
                                <el-input v-model="form.timeLimit"></el-input>
                            </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
                    </el-dialog>
                    <!-- 新增弹出框 -->
                    <el-dialog title="新增" :visible.sync="addVisible" width="30%"  @close="closeDialog">
                        <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="form.name" maxlength="50"
                                          show-word-limit></el-input>
                            </el-form-item>
                            <el-form-item label="发生可能性" prop="happen">
                                <el-input-number v-model="form.happen" number></el-input-number>
                            </el-form-item>
                            <el-form-item label="后果严重性" prop="consequence">
                                <el-input-number v-model="form.consequence" number></el-input-number>
                            </el-form-item>
                            <el-form-item label="判定准则" prop="criterion">
                                <el-input-number v-model="form.criterion" number></el-input-number>
                            </el-form-item>
                            <el-form-item label="风险等级" prop="riskLevel">
                                <el-input v-model="form.riskLevel"></el-input>
                            </el-form-item>
                            <el-form-item label="四色标识" prop="fourColor">
                                <el-color-picker v-model="form.fourColor"></el-color-picker>
                            </el-form-item>
                            <el-form-item label="控制措施" prop="measures">
                                <el-input v-model="form.measures" type="textarea"></el-input>
                            </el-form-item>
                            <el-form-item label="实施期限" prop="timeLimit">
                                <el-input v-model="form.timeLimit"></el-input>
                            </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
                    </el-dialog>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: 'dashboard',
        data() {
            return {
                rules:{
                    name:[{
                        required:true,message:'请输入危险源名称',trigger:'blur'
                    }],
                    happen:[{
                        required:true,message:'请输入发生可能性',trigger:'blur'
                    }],
                    consequence:[{
                        required:true,message:'请输入后果严重性',trigger:'blur'
                    }],
                    criterion:[{
                        required:true,message:'请输入判定准则',trigger:'blur'
                    }],
                    riskLevel:[{
                        required:true,message:'请输入安全风险等级',trigger:'blur'
                    }],
                    measures:[{
                        required:true,message:'请输入控制措施',trigger:'blur'
                    }],
                    timeLimit:[{
                        required:true,message:'请输入实施期限',trigger:'blur'
                    }],
                    fourColor:[{
                        required:true,message:'请选择四色标识',trigger:'blur'
                    }]
                },
                query: {
                    pageIndex: 1,
                    pageSize: 10
                },
                pageTotal: 0,
                tableData: [],
                addVisible:false,
                editVisible:false,
                helpDialog:false,
                fourColorPic:'',
                uploadUrl:'',
                form:{},
                idx:-1,
                headers:{
                    token : localStorage.getItem("token")
                },
                riskSourcesData: [{
                    col0: '20-25',
                    col1: '重大风险',
                    col2: '在采取措施降低风险前，不能继续作业，对改进措施进行评估',
                    col3: '立刻'
                }
                    ,{
                        col0: '15-16',
                        col1: '较大风险',
                        col2: '采取紧急措施降低风险，建立运行控制程序，定期检查、测量及评估',
                        col3: '立即或近期整改'
                    }
                    ,{
                        col0: '9-12',
                        col1: '一般风险',
                        col2: '可考虑建立目标、建立操作规程，加强培训及沟通',
                        col3: '2年内治理'
                    }
                    ,{
                        col0: '4-8',
                        col1: '低风险',
                        col2: '可考虑建立操作规程、作业指导书但需定期检查',
                        col3: '有条件、有经费时治理'
                    }
                    ,{
                        col0: '1-3',
                        col1: '低风险',
                        col2: '无需采用控制措施',
                        col3: '需保存记录'
                    }
                ],
            };
        },
        created(){
            this.uploadUrl = this.$baseURL + "/org/upload4ColorPic";
            this.loadFourColorPic();
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
                this.$axios.get("/hazardSourcesList/hazardSourcesListsByPage",{
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
                this.form=row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/hazardSourcesList/hazardSourcesList/" + this.form.id).then(res => {
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
                        this.$axios.put("/hazardSourcesList/hazardSourcesList?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/hazardSourcesList/hazardSourcesList",this.$qs.stringify(this.form)).then(res=>{
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
            loadFourColorPic(){
                this.$axios.get("/org/fourColorPic").then(res =>{
                    if(res.data.result.resultCode==200){
                        this.fourColorPic=this.$baseURL + "/" + res.data.data;
                    }
                }).catch(error=>{
                    console.log(error);
                })
            },
            handleAvatarSuccess(res, file) {
                console.log(res);
                if(res.result.resultCode==200){
                    this.loadFourColorPic();
                }else{
                    this.$message.error(res.result.message);
                }
            },
            beforeAvatarUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2;
                const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';

                if (!isJPG && !isGIF && !isPNG && !isBMP) {
                    this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 2MB!');
                }
                return isJPG && isLt2M;
            },
            // cellStyle(row, column, rowIndex, columnIndex){
            fourColorBg(obj){
               if(obj.columnIndex==6){
                    return 'backgroundColor:' + obj.row.fourColor;
               }
               return '';
            },
            cellStyle(obj){
                if(obj.rowIndex==0 && obj.columnIndex==0){
                    return 'backgroundColor:red';
                }
                if(obj.rowIndex==1 && obj.columnIndex==0){
                    return 'backgroundColor:#E6A23C';
                }
                if(obj.rowIndex==2 && obj.columnIndex==0){
                    return 'backgroundColor:yellow';
                }
                if(obj.rowIndex==3 && obj.columnIndex==0){
                    return 'backgroundColor:#6699CC';
                }
                if(obj.rowIndex==4 && obj.columnIndex==0){
                    return 'backgroundColor:#6699CC';
                }
            },
            changeDate() {
                const now = new Date().getTime();
                this.data.forEach((item, index) => {
                    const date = new Date(now - (6 - index) * 86400000);
                    item.name = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                });
            },
            handleUpload(){
                this.$refs.fileUploadBtn.$el.click();
            },
            download(){
                window.location.href=this.$baseURL + "/category.xlsx"
            }
        }
    };
</script>


<style scoped>
    .el-row {
        margin-bottom: 20px;
    }

    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
    }

    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #999;
    }

    .grid-num {
        font-size: 30px;
        font-weight: bold;
    }

    .grid-con-icon {
        font-size: 50px;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
        color: #fff;
    }

    .grid-con-1 .grid-con-icon {
        background: rgb(45, 140, 240);
    }

    .grid-con-1 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-2 .grid-con-icon {
        background: rgb(100, 213, 114);
    }

    .grid-con-2 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-3 .grid-con-icon {
        background: rgb(242, 94, 67);
    }

    .grid-con-3 .grid-num {
        color: rgb(242, 94, 67);
    }

    .user-info {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #ccc;
        margin-bottom: 20px;
    }

    .user-avator {
        width: 120px;
        height: 120px;
        border-radius: 50%;
    }

    .user-info-cont {
        padding-left: 50px;
        flex: 1;
        font-size: 14px;
        color: #999;
    }

    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list {
        font-size: 14px;
        color: #999;
        line-height: 25px;
    }

    .user-info-list span {
        margin-left: 70px;
    }

    .mgb20 {
        margin-bottom: 20px;
    }

    .todo-item {
        font-size: 14px;
    }
</style>
