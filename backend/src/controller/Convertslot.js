 const Convertslot=(slots)=>{
    return Object.entries(slots).map(([time,available]) => {
        const [start, end] = time.split('-');
        const startHour =  parseInt(start); 
        const endHour =  parseInt(end);
    
        return {
          startHour,
          endHour,
          available
        };
      });
    
 }

module.exports=Convertslot;