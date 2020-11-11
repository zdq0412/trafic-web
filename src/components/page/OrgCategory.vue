<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 企业类别管理
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
                <el-input v-model="query.name" placeholder="企业类别名称" class="handle-input mr10"></el-input>
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
                <el-table-column prop="safetyCostRatio" label="安全生产费用提取标准">
                    <template slot-scope="scope">
                        <div>{{scope.row.safetyCostRatio}}%</div>
                    </template>
                </el-table-column>
                <el-table-column prop="deleted" label="状态">
                    <template slot-scope="scope">
                        <span v-if="scope.row.deleted" style="color:red;">已停用</span>
                        <span v-else>正常</span>
                    </template>
                </el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="250" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-share"
                                class="lightYellow"
                                @click="handleFunction(scope.$index, scope.row)"
                        >授权</el-button>
                        <el-button
                                type="text"
                                icon="el-icon-user"
                                style="color: #67C23A;"
                                @click="handleCommonPosition(scope.$index, scope.row)"
                        >预设职位</el-button>
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
            <el-form ref="form" :rules="rules" :model="editableForm" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editableForm.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="提取标准%" prop="safetyCostRatio">
                    <el-input-number v-model="editableForm.safetyCostRatio"  maxlength="10"  placeholder="安全生产费用提取标准"></el-input-number>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="editableForm.note"  maxlength="500"  type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelEdit()">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="提取标准%" prop="safetyCostRatio">
                    <el-input-number v-model="form.safetyCostRatio"  maxlength="10"  placeholder="安全生产费用提取标准"></el-input-number>
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
        <el-dialog title="授权" :visible.sync="grantFunctionVisible" width="40%">
            <el-checkbox v-model="checkAll"  @change="handleCheckAllChange">全选</el-checkbox>
            <div style="height:500px;overflow: auto;">
                <function-tree ref="functionTree" v-if="grantFunctionVisible" :paramType="param" :param="orgCategoryId"></function-tree>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="grantFunctionVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveFunctions">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 预设职位对话框 -->
        <el-dialog title="预设职位" :visible.sync="commonPositionVisible" width="40%">
            <el-checkbox v-model="checkAllCommonPosition"  @change="handleCommonPostionsChange">全选</el-checkbox>
            <div style="height:500px;overflow: auto;">
                <common-position-tree ref="commonPositionTree" v-if="commonPositionVisible" :param="orgCategoryId"></common-position-tree>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="commonPositionVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCommonPositions">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import FunctionTree from "../common/FunctionTree"
    import {getDate} from "../common/utils";
    import CommonPositionTree from "../common/CommonPositionTree"
    export default {
        components:{
            FunctionTree,CommonPositionTree
        },
        name: 'basetable',
        data() {
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                checkAll:false,
                checkAllCommonPosition:false,
                tableData: [],
                delList: [],
                orgCategoryId:'',
                param:'orgCategory',
                editVisible: false,
                addVisible: false,
                grantFunctionVisible:false,
                commonPositionVisible:false,
                pageTotal: 0,
                form: {},
                editableForm:{},
                idx: -1,
                id: -1,
                rules:{
                    name:[{
                        required:true,message:'请输入企业类别名称',trigger:'blur'
                    }],
                    safetyCostRatio:[{
                        required:true,message:'请输入安全生产费用提取标准',trigger:'blur'
                    }]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            cancelEdit(){
                this.editVisible = false;
                this.editableForm = JSON.parse(JSON.stringify(this.form));
            },
            handleCheckAllChange(val) {
                if (this.checkAll) {
                    this.$refs.functionTree.$refs.tree.setCheckedNodes(this.$refs.functionTree.functions);
                } else {
                    this.$refs.functionTree.$refs.tree.setCheckedKeys([]);
                }
            },
            handleCommonPostionsChange(val) {
                if (this.checkAllCommonPosition) {
                    this.$refs.commonPositionTree.$refs.tree.setCheckedNodes(this.$refs.commonPositionTree.commonPositions);
                } else {
                    this.$refs.commonPositionTree.$refs.tree.setCheckedKeys([]);
                }
            },
            //保存权限
            saveFunctions(){
                let checkedIds = this.$refs.functionTree.getCheckedKeys();
                let param = new FormData();
                param.append("functionsId",JSON.stringify(checkedIds));
                param.append("orgCategoryId",this.orgCategoryId);
                this.$axios.put("functions/orgCategoryFunctions",param).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.grantFunctionVisible = false;
                        this.$message.success("授权成功!");
                    }
                }).catch(error=>{
                    console.log(error);
                });
            },
            //保存预设职位
            saveCommonPositions(){
                let checkedIds = this.$refs.commonPositionTree.getCheckedKeys();
                let param = new FormData();
                param.append("commonPositionsId",JSON.stringify(checkedIds));
                param.append("orgCategoryId",this.orgCategoryId);
                this.$axios.put("commonPosition/commonPositionOrgCategorys",param).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.commonPositionVisible = false;
                        this.$message.success("设置成功!");
                    }
                }).catch(error=>{
                    console.log(error);
                });
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            //格式化布尔类型值
            formatDate(row,column,cellValue){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/orgCategory/orgCategorysByPage",{
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
               /* this.form = row;
                this.form.operType = operType;*/
                let f = row;
                f.operType=operType;
                // 二次确认删除
                this.$confirm('确定执行该操作吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                        this.$axios.post("/orgCategory/orgCategoryStatus",this.$qs.stringify(f)).then(res => {
                            this.$message.success('操作成功');
                            this.getData();
                        }) .catch(error =>{
                            this.$message.error(res.data.result.message);
                        });
                    })
                    .catch(() => {});
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editableForm = JSON.parse(JSON.stringify(this.form));
                this.editVisible = true;
            },
            // 授权操作
            handleFunction(index, row) {
                this.idx = index;
                this.grantFunctionVisible = true;
                this.orgCategoryId = row.id;
                this.checkAll = false;
            },
            // 预设职位分配操作
            handleCommonPosition(index, row) {
                this.idx = index;
                this.commonPositionVisible = true;
                this.orgCategoryId = row.id;
                this.checkAllCommonPosition = false;
            },
            // 保存编辑
            saveEdit() {
                this.form = this.editableForm;
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/orgCategory/orgCategory?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.$message.success("修改成功!");
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error("编辑失败：企业类别名称已被使用!");
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
                        this.$axios.post("/orgCategory/orgCategory",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error("添加失败：企业类别名称已被使用!");
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
