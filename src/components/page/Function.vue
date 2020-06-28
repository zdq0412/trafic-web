<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 权限管理
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
                <el-input v-model="query.name" placeholder="权限名" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="id"
                    border
                    default-expand-all
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column>-->
                <el-table-column prop="name" label="权限名"></el-table-column>
                <el-table-column prop="icon" label="图标"></el-table-column>
                <el-table-column prop="index" label="访问路径"></el-table-column>
                <el-table-column prop="priority" label="优先级"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-share"
                                class="lightYellow"
                                @click="handleFunction(scope.$index, scope.row)"
                        >功能</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="权限名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="图标">
                    <el-input v-model="form.icon"></el-input>
                </el-form-item>
                <el-form-item label="路径">
                    <el-input v-model="form.index"></el-input>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-input-number v-model="form.priority"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
       <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="父菜单">
                    <el-input v-model="form.parenName"></el-input>
                </el-form-item>
                <el-form-item label="权限名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="图标">
                        <el-input v-model="form.icon"></el-input>
                </el-form-item>
                <el-form-item label="路径">
                    <el-input v-model="form.index"></el-input>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-input-number v-model="form.priority"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!--查看菜单功能对话框-->
        <el-dialog title="功能" :visible.sync="functionVisible" width="80%" append-to-body="true">
            <div style="height:100%;overflow: auto;">
                <function-component></function-component>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="functionVisible = false">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import FunctionComponent from '../common/FunctionComponent'
    export default {
        components:{
            FunctionComponent
        },
        name: 'basetable',
        data() {
            return {
                query: {
                    address: '',
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                value :'',
                role:'',
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                functionVisible:false,
                pageTotal: 0,
                form: {
                    parent:{
                        name:''
                    }
                },
                idx: -1,
                id: -1
            };
        },
        created() {
            this.getData();
        },
        methods: {
            // 获取 easy-mock 的模拟数据
            getData() {
                this.tableData = [
                    {
                        id:1,
                        name:'设置',
                        icon:'set',
                        index :'',
                        priority:-1,
                        children:[
                            {
                                id:2,
                                name:'用户管理',
                                icon:'',
                                index :'/user',
                                priority:10
                            }, {
                                id:3,
                                name:'角色管理',
                                icon:'',
                                index :'/role',
                                priority:20
                            }, {
                                id:4,
                                name:'权限管理',
                                icon:'',
                                index :'/function',
                                priority:30
                            }
                        ]
                    }
                ];
                this.pageTotal = 1;
            },
            // 触发搜索按钮
            handleSearch() {
                this.$set(this.query, 'pageIndex', 1);
                this.getData();
            },
            // 删除操作
            handleDelete(index, row) {
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$message.success('删除成功');
                        this.tableData.splice(index, 1);
                    })
                    .catch(() => {});
            },
            // 多选操作
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editVisible = true;
            },
            // 查看功能
            handleFunction(index, row) {
                this.idx = index;
                this.form = row;
                this.functionVisible = true;
            },
            // 保存编辑
            saveEdit() {
                this.editVisible = false;
                this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                this.$set(this.tableData, this.idx, this.form);
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
