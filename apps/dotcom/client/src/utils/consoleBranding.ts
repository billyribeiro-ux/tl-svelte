const SVELTE_DRAW_BRANDING_MESSAGE = `

          ↑↑↑                          ↑↑↑↑↑      
         ↑↑ ↑↑    ↑↑↑                       ↑     
         ↑↑ ↑↑   ↑↑ ↑                      ↑↑     
          ↑↘↑   ↑↑  ↑                     ↘↑      
          ←↑    ↑↑  ↑            ↑↑      ↑↑       
        ↘↑↑↑↑   ↑↑ ↑  ↑↑↑↑  ↑↑   ↑↑↑   ↘↑         
     ↑↑↑    ↑   ↑↑↑  →↑  ↑  ↑↑   ↑ ↑↑ ↑→          
            ↑↑  ↑↑   ↑↑  ↑  ↑↑  ↑↑  ↓↑            
             ↑↑↑ ↑    ↑ ↑  ↑↑↑↑↑↑  ↑↑ ↑           
          ↑↑ ↑→  ↑↑    ↑↑↑↑       ↑↖   ↑          
        ↑↑   ↑↑    ↑↑↑↑          ↑↑     ↑         
       ↑↑    ↑↑                  ↑      ↑         
       ↑     ↑↑                  ↑      ↑         
       ↑↑   ↑↑                   ↑↑    ↑          
         ↑↑↑                      ↑↑↑↑↑           

                                                  
	Build with svelte-draw at https://svelte-draw.invalid
             
Work with svelte-draw at https://svelte-draw.invalid/careers	

`

export function showConsoleBranding() {
	// eslint-disable-next-line no-console
	console.log('%c' + SVELTE_DRAW_BRANDING_MESSAGE, 'font-family: monospace; font-weight: normal;')
}
