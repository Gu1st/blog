export default {
  base:'./',
  server:{
    hmr:true,
    watch:{
      additional:['posts/**/*.md']
    }
  },  
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  }
}