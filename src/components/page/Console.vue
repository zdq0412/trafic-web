<template>
    <div style="overflow: auto;">
        <div>
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item>
                        <i class="el-icon-lx-cascades"></i> 过期提醒
                    </el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="container">
                <div style="width: 95%;text-align: right;font-size:14px;color:#FF0000;margin-top:-20px;margin-bottom:5px;">扣分合计：{{total}}</div>
                <el-table
                        :data="tableData"
                        style="width: 100%;height:80%;"
                        row-key="id"
                        border
                        :row-style="rowStyle">
                    <el-table-column prop="orgName" label="企业名称"></el-table-column>
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="subjectName" label="所属类别"></el-table-column>
                    <el-table-column prop="endDate" label="截止日期" :formatter="dateFormatter"></el-table-column>
                    <el-table-column prop="deductPoints" label="扣分"></el-table-column>
                    <el-table-column label="操作" width="180" align="center">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.bgColor=='#FF0000'"
                                    type="text"
                                    icon="el-icon-delete"
                                    class="red"
                                    @click="handleDelete(scope.$index, scope.row)"
                            >移除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script>
    import {getDate} from "../common/utils";
    export default {
    name: 'dashboard',
    data() {
        return {
            tableData:[],
            total:0
        };
    },
    created(){
      this.getData();
    },
    methods: {
        handleDelete(index,row){
            this.$axios.delete("/remind/remind/" + row.id).then(res => {
                if (res.data.result.resultCode == 200) {
                    this.$message.success('删除成功');
                    this.getData();
                } else {
                    this.$message.error(res.data.result.message);
                }
            }).catch(error => {
                console.log(error);
            });
        },
        dateFormatter(row,column,cellValue){
            if(cellValue){
                return getDate(new Date(cellValue));
            }else{
                return '';
            }
        },
        rowStyle({row}){
          return {color:row.bgColor};
        },
        getData(){
            this.total=0;
            this.$axios.get("/remind/reminds").then(res => {
                this.tableData=res.data;
                if(this.tableData && this.tableData.length>0){
                    for(let i = 0;i<this.tableData.length;i++){
                        this.total+=this.tableData[i].deductPoints;
                    }
                }
            }).catch(error=>{
                console.log(error);
            })
        },
    }
};
</script>
<style scoped>
</style>
