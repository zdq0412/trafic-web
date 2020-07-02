<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 组织机构管理
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
                    @selection-change="handleSelectionChange"
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="代码">
                            <el-input v-model="form.code"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="名称">
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
                        <el-form-item label="手机号">
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
                            <el-cascader style="width: 100%;"
                                         v-model="value"
                                         :options="options"
                                         @change="handleChange"></el-cascader>
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
        <el-dialog title="新增" :visible.sync="addVisible" width="40%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="代码">
                            <el-input v-model="form.code"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col>
                        <el-form-item label="名称">
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
                        <el-form-item label="手机号">
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
                            <el-cascader style="width: 100%;"
                                    v-model="value"
                                    :options="options"
                                    @change="handleChange"></el-cascader>
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
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import { fetchData } from '../../api/index';
    export default {
        name: 'basetable',
        data() {
            return {
                query: {
                    address: '',
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,
                options: [{
                    value: '浙江',
                    label: '浙江',
                    children: [{
                        value: '嘉兴',
                        label: '嘉兴',
                        children: [{
                            value: '南湖',
                            label: '南湖'
                        }, {
                            value: '秀洲',
                            label: '秀洲'
                        }]
                    }]}]
            };
        },
        created() {
            this.getData();
        },
        methods: {
            showAddSchemaDialog(){

            },
            // 获取 easy-mock 的模拟数据
            getData() {
                    this.tableData = [{
                        code:'1001',
                        name:'华为',
                        addr:'北京朝阳区',
                        province:'北京',
                        city:'北京',
                        region:'朝阳',
                        contact:'任正非',
                        tel :'13025841265',
                        note:'手机供应商',
                        legalPerson:'任正非'
                    },{
                        code:'1002',
                        name:'小米',
                        addr:'北京朝阳区',
                        province:'北京',
                        city:'北京',
                        region:'朝阳',
                        contact:'雷军',
                        tel :'13025841265',
                        note:'手机供应商',
                        legalPerson:'雷军'
                    }];
                    this.pageTotal = 2;
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
