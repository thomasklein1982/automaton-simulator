<template>
  <MenuBar :model="items" >
    <template #start>
      
    </template>
    <template #end>
      <Button severity="secondary" rounded size="small" style="margin-right: 0.5rem" label="" icon="pi pi-undo" @click="$emit('undo')"/>
      <Button severity="secondary" rounded size="small" style="margin-right: 0.5rem" label="" icon="pi pi-refresh" @click="$emit('redo')"/>
    </template>
  </Menubar>  
</template>

<script>
import MenuBar from 'primevue/menubar';
import Button from 'primevue/button';

export default {
  props: {
    
  },
  data(){
    return {
      
    };
  },
  computed: {
    items(){
      return [
        {
          label: 'Neu',
          icon: 'pi pi-file',
          command: (ev)=>{
            this.$emit('new');
          }
        },
        {
          label: 'Hochladen',
          icon: 'pi pi-upload',
          command: (ev)=>{
            this.$emit('upload');
          }
        },
        {
          label: 'Herunterladen',
          icon: 'pi pi-download',
          command: (ev)=>{
            this.$emit('download');
          }
        }
      ];
    }
  },
  methods: {
    
  },
  components: {
    MenuBar, Button
  }
}
</script>

<style scoped>

</style>