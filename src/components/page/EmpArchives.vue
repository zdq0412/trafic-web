<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 企业人员档案
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.name" placeholder="人员名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    header-cell-class-name="table-header"
            >
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="position.name" label="职务"></el-table-column>
                <el-table-column label="简历">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'resume')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(0)}})
                            <!--<span style="color: #DEA514;">({{scope.row.archiveCode | formatArchiveCode(0)}})</span>--></el-button>
                    </template>
                </el-table-column>
                <!--<el-table-column label="身份证">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'idcard')"
                        >查看</el-button>
                    </template>
                </el-table-column>-->
                <el-table-column label="劳动合同">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'contract')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(1)}})</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="资质文件">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'qualificationDocument')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(2)}})</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="从业经历">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'jobHistory')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(3)}})</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="入职培训">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'inductionTraining')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(4)}})</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="安全责任书">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'safetyResponsibilityAgreement')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(5)}})</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="培训考核情况">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'trainingExamine')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(6)}})</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="其他档案">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row,'otherDocument')"
                        >查看({{scope.row.archiveCode | formatArchiveCode(7)}})</el-button>
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
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,
            };
        },
        created() {
            this.getData();
        },
        filters:{
            formatArchiveCode(archiveCode,index){
                if(archiveCode){
                    return archiveCode.split(".")[index];
                }else{
                    return 0;
                }
            }
        },
        methods: {
            getData() {
                this.$axios.get("/employee/employeesByPage", {
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
            // 查看人员档案
            lookup(index, row,type) {
                switch(type){
                    case "resume":{
                        this.$router.push({name:"resume",params:{empId:row.id}});
                        break;
                    }
                    case "idcard":{
                        this.$router.push({name:"idcard",params:{empId:row.id}});
                        break;
                    }
                    case "contract":{
                        this.$router.push({name:"contract",params:{empId:row.id}});
                        break;
                    }
                    case "qualificationDocument":{
                        this.$router.push({name:"qualificationDocument",params:{empId:row.id}});
                        break;
                    }
                    case "jobHistory":{
                        this.$router.push({name:"jobHistory",params:{empId:row.id}});
                        break;
                    }
                    case "inductionTraining":{
                        this.$router.push({name:"inductionTraining",params:{empId:row.id}});
                        break;
                    }
                    case "safetyResponsibilityAgreement":{
                        this.$router.push({name:"safetyResponsibilityAgreement",params:{empId:row.id}});
                        break;
                    }
                    case "trainingExamine":{
                        this.$router.push({name:"trainingExamine",params:{empId:row.id}});
                        break;
                    }
                    case "otherDocument":{
                        this.$router.push({name:"otherDocument",params:{empId:row.id}});
                        break;
                    }
                }
                localStorage.setItem("empName",row.name);
                localStorage.setItem("empId",row.id);
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
    .avatar{
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
</style>
