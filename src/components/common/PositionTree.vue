<template>
    <el-tree
            :data="positions"
            show-checkbox
            node-key="id"
            default-expand-all
            highlight-current
            ref="tree"
            :default-checked-keys="positionIds"
            :props="defaultProps">
    </el-tree>
</template>
<script>
    export default {
        props:['param'],
        data() {
            return {
                positions:[],
                positionIds:[],
                defaultProps: {
                    children: 'children',
                    label: 'name'
                }
            };
        },
        mounted(){
            this.getData();
        },
        methods:{
            getCheckedKeys(){
                let nodes = this.$refs.tree.getCheckedNodes();
                let positionIds = [];
                for(let i = 0;i<nodes.length;i++){
                    if(nodes[i].type=='position'){
                        positionIds.push(nodes[i].id);
                    }
                }
                return positionIds;
            },
            getData(){
                let url = '';
                let params = {};
                url='positions/employeePositions';
                params={employeeId:this.param};
                this.$axios.get(url,{
                    params:params
                }).then(res =>{
                    this.positions=res.data.positions;
                    this.positionIds = res.data.positionIds;
                }).catch(error => {
                    console.log(error);
                })
            }
        }
    };
</script>

<style scoped>

</style>