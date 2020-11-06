<template>
    <el-tree
            :data="commonPositions"
            show-checkbox
            node-key="id"
            ref="tree"
            :default-checked-keys="commonPositionIds"
            :props="defaultProps">
    </el-tree>
</template>
<script>
    export default {
        props:['param'],
        data() {
            return {
                commonPositions:[],
                commonPositionIds:[],
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
                return this.$refs.tree.getCheckedKeys();
            },
            getData(){
                let url = '';
                let params = {};
                url='commonPositions/orgCategoryCommonPositions';
                params={orgCategoryId:this.param};
                this.$axios.get(url,{
                    params:params
                }).then(res =>{
                    this.commonPositions=res.data.commonPositions;
                    this.commonPositionIds = res.data.commonPositionIds;
                }).catch(error => {
                    console.log(error);
                })
            }
        }
    };
</script>

<style scoped>

</style>