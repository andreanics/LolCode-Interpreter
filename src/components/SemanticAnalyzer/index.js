import React from 'react';
import * as cls from '../LexicalAnalyzer/Classifications'

const init_value = ''
const operators = [cls.addition_op,cls.subtraction_op,cls.multiplication_op,cls.division_op,cls.modulo_op,cls.greater_than,cls.less_than,cls.equal_op,cls.not_equal_op,cls.and_op,cls.or_op,cls.xor_op,cls.not_op, cls.infinite_and, cls.infinite_or]

class SemanticAnalyzer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            lexemes: [...this.props.data],
            symbol_table: [["IT",init_value]],
            text: [],  
        }
        this.findVariables = this.findVariables.bind(this);
        this.cleanArr = this.cleanArr.bind(this)
        this.solveExpression = this.solveExpression.bind(this);
        this.printOutput = this.printOutput.bind(this);
    }

    componentDidMount(){
        this.props.func.getSymbols(this.state.symbol_table);
        this.cleanArr()
    }

    /* Removes comment, code delimiter, and string delimiter */
    cleanArr(){
        var arr = this.state.lexemes;
        var c;
        for (let i = 0; i< arr.length; i++) {
            c = arr[i][1]
            if(c.match(/Comment/) || c.match(/Code/) || c.match(/String Delimiter/)){
                arr.splice(i,1);
                i--;
            }
        }
        arr = this.findVariables(arr)
       
        this.printOutput(arr)
    }
    /**** FOR FIXING: IT variable implementation *****/
    /* Find variable declaration/initialization */
    findVariables(arr){
        try {
            for (let i = 0; i< arr.length; i++) {
                /* With initialization */
                if(arr[i][1].match(cls.variable_decl)  && arr[i+1][1].match(cls.varident)  && arr[i+2][1].match(cls.variable_init) && arr[i+3][1].match(/Literal/)){
                    this.state.symbol_table.push([arr[i+1][0], arr[i+3][0]])
                    this.state.symbol_table[0][1] = arr[i+3][0]
                }
                /* Without initialization */
                else if(arr[i][1].match(cls.variable_decl)  && arr[i+1][1].match(cls.varident)){
                    this.state.symbol_table.push([arr[i+1][0],init_value])
                }
            }
            let temp = []
            arr = this.findExpressions(arr)
            while(true){
                temp = this.findExpressions(arr)
                if(arr !== temp) arr = temp;
                else break
            }
            return arr
        } catch (error) {}
    }

    /* Find and solve expressions */
    findExpressions(arr){ 
        var c, temp,n;
        for (let i = arr.length-1; i >= 0; i--) {
            c = arr[i][1]
            /* If an expression operator is found, it will be removed from the array and 
            will be replaced with the evaluated answer */
            if(operators.includes(c)){
                n = 0
                while(arr[i+n][1]!=="New line") n++;
                temp = this.solveExpression(arr,i,i+n);
                if(temp !== null){
                    this.state.symbol_table[0][1] = temp[0][0]
                    arr.splice(i,n,temp[0]);
                    let j = i + 1;
                    for (let x = 1; x < temp.length; x++) {
                        arr.splice(j,0,temp[x]);   // Replace
                        j++;
                    }
                }
            }
        }
        return this.findStatements(arr)
    }
    
    /* Solves found expression */
    solveExpression(arr,startIndex,endIndex){
        
        var str = String(arr[startIndex][0]).slice()
        for (let i= (startIndex+1); i < (endIndex+1); i++) {
            str = str.concat(" ",arr[i][0])
        }

        // Convert to prefix notation
        str = str.replace(/SUM OF/g,"+")
        str = str.replace(/DIFF OF/g,"-")
        str = str.replace(/PRODUKT OF/g,"*")
        str = str.replace(/QUOSHUNT OF/g,"/")
        str = str.replace(/MOD OF/g,"%")
        str = str.replace(/BIGGR OF/g,"max")
        str = str.replace(/SMALLR OF/g,"min")
        str = str.replace(/BOTH OF/g,"&&")
        str = str.replace(/ALL OF/g,"&&&")  // ALL OF
        str = str.replace(/EITHER OF/g,"||")
        str = str.replace(/ANY OF/g,"|||") // ANY OF
        str = str.replace(/WON OF/g,"^")        // XOR
        str = str.replace(/NOT/g,"!")
        str = str.replace(/BOTH SAEM/g,"===")
        str = str.replace(/DIFFRINT/g,"!==")
        str = str.replace(/AN/g,"")
        str = str.replace(/WIN/g,"true")
        str = str.replace(/FAIL/g,"false")
        str = str.replace(/\s+/g,",")
        
        let trails = []
        let is_XOR = false;

        // Format String
        let spl = str.split(',')
        if(spl[0] === "^") is_XOR = true;
        if(spl[0] === "max"){
            // Trailing values
            if(spl.length > 4 ){
                for (let i = 3; i < spl.length-1; i++) {
                    spl[i] = spl[i].toString().replace(/true/g,"WIN")
                    spl[i] = spl[i].toString().replace(/false/g,"FAIL")
                    if(is_XOR){
                        spl[i] = spl[i].toString().replace(/1/g,"WIN")
                        spl[i] = spl[i].toString().replace(/0/g,"FAIL")
                    }
                    trails.push([spl[i],"Literal"])
                }
            }
            spl = [ "Math.max( "+ spl[1] + ", " + spl[2] + " )" ]
        }
        else if(spl[0] === "min"){
            // Trailing values
            if(spl.length > 4 ){
                for (let i = 3; i < spl.length-1; i++) {
                    spl[i] = spl[i].toString().replace(/true/g,"WIN")
                    spl[i] = spl[i].toString().replace(/false/g,"FAIL")
                    if(is_XOR){
                        spl[i] = spl[i].toString().replace(/1/g,"WIN")
                        spl[i] = spl[i].toString().replace(/0/g,"FAIL")
                    }
                    trails.push([spl[i],"Literal"])
                }
            }
            spl = [ "Math.min( "+ spl[1] + ", " + spl[2] + " )" ]
        }
        else if(spl[0] === "!"){
            spl = [ spl[0] +" " + spl[1]  ]
        }
        else if(spl[0] === "&&&"){      // ALL_OF
            let temp = [" "]
            for (let i= 1; i < spl.length-2; i++) {
                temp.push(spl[i])
                temp.push(" && ")
            }
            temp.push(spl[spl.length-2])
            spl = temp
        }
        else if(spl[0] === "|||"){      // ALL_OF
            let temp = [" "]
            for (let i= 1; i < spl.length-2; i++) {
                temp.push(spl[i])
                temp.push(" || ")
            }
            temp.push(spl[spl.length-2])
            spl = temp
        }
        else{
            // Trailing values
            if(spl.length > 4 ){
                for (let i = 3; i < spl.length-1; i++) {
                    spl[i] = spl[i].toString().replace(/true/g,"WIN")
                    spl[i] = spl[i].toString().replace(/false/g,"FAIL")
                    if(is_XOR){
                        spl[i] = spl[i].toString().replace(/1/g,"WIN")
                        spl[i] = spl[i].toString().replace(/0/g,"FAIL")
                    }
                    trails.push([spl[i],"Literal"])
                }
            }
            spl = [ " " + spl[1], spl[0], spl[2] ]
        }
        
        // Convert variables to values
        let str1 = spl.join(' ')
        for (let i = 0; i < this.state.symbol_table.length; i++) {
            if(this.state.symbol_table[i][1] != init_value){
                str1 = str1.replace(' ' + this.state.symbol_table[i][0], ' ' + this.state.symbol_table[i][1])
            }
        }
        str1 = str1.replace(/WIN/g,"true")
        str1 = str1.replace(/FAIL/g,"false")
        let ans_arr = []
        // Evaluate answer
        try {
            let ans = eval(str1)
            if(ans !== true && ans !== false){
                if(is_XOR){  // int bool
                    ans = ans.toString().replace("1","WIN")
                    ans = ans.toString().replace("0","FAIL")
                }
                else{  // integer
                    ans = Math.round(ans*100) / 100
                }
                
            }
            else{   // boolean
                ans = ans.toString().replace(/true/g,"WIN")
                ans = ans.toString().replace(/false/g,"FAIL")
            }
            
            this.state.symbol_table[0][1] = ans.toString()        // IT variable
            ans_arr.push([ans.toString(),"Literal"])
            if(trails !== []) ans_arr = ans_arr.concat(trails)
            return ans_arr;       
        } catch (e) {
            return null
        }     
    }

    solveCondition(arr,startIndex,endIndex){
        let cond, n
        if(this.state.symbol_table[0][1] === init_value) return null
        if(this.state.symbol_table[0][1] === "WIN") cond = cls.if_key
        else if(this.state.symbol_table[0][1] === "FAIL") cond = cls.else_key
        else return null

        let result = []
        for (let i= (startIndex+1); i < (endIndex+1); i++) {
            
            if(arr[i][1] === cond){
                n = 1
                while(arr[i+n][1] !== "New line"){
                    result.push(arr[i+n])
                    n++
                }
                result.push(arr[i+n])
                return result
            }
        }
    }

    solveSwitch(val, arr,startIndex,endIndex){
        console.log(val)
        let n
        let result = []
        let default_res = []
        if(val === init_value) return null

        for (let i= (startIndex+1); i < (endIndex+1); i++) {

            if(arr[i][1] === cls.case_key){
                console.log(arr[i+1][0], val )
                if(arr[i+1][0] === val){
                    n = 2
                    while(arr[i+n][1] !== cls.break_key){
                        result.push(arr[i+n])
                        n++
                    }
                    result.push(["\n", "New line"])
                    return result
                }
            }
            if(arr[i][1] === cls.default_key){
                n = 1
                while(arr[i+n][1] !== "New line"){
                    default_res.push(arr[i+n])
                    n++
                }
                default_res.push(arr[i+n])
            }
        }
        return default_res

    }

    findIT(arr){
        let name, val
        for (let i = 0; i< arr.length; i++) {
            name = arr[i][1].substring(20,arr[i][1].length)
            val = arr[i][0]
            if ("IT" === name && val !== init_value && val !== "IT"){
                if(val !== "FAIL" && val !== "WIN") return val
            }
        }
        return init_value
    }

    /* Find variable assignments */
    findStatements(arr){ 
        for (let i = 0; i< arr.length; i++) {
            /* Variable assignment */
            if(arr[i][1].match(cls.varident)  && arr[i+1][1].match(cls.variable_assign) && (arr[i+2][1].match(/Literal/) || arr[i+2][1].match(cls.varident))){
                let name = arr[i][1].substring(20,arr[i][1].length)
                let name1 = arr[i+2][1].substring(20,arr[i+2][1].length)
                if(name === 'IT' && arr[i+2][0] !== name1){
                    this.state.symbol_table[0][1] = arr[i+2][0]
                    this.props.func.getSymbols(this.state.symbol_table);
                }
                for (let j = 0; j< this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i][0] && arr[i+2][0] !== name1){
                        this.state.symbol_table[j][1] = arr[i+2][0]
                        this.props.func.getSymbols(this.state.symbol_table);
                    }                
                }
            }
            /* Variable declaration with expressions as values */
            if(arr[i][1].match(cls.variable_decl)  && arr[i+1][1].match(cls.varident)  && arr[i+2][1].match(cls.variable_init) && arr[i+3][1].match(/Literal/)){
                
                for (let j = 0; j< this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i+1][0]){
                        this.state.symbol_table[j][1] = arr[i+3][0]
                        this.props.func.getSymbols(this.state.symbol_table);
                    }                
                }
            }
            /* Change variables with evaluated values */
            if(arr[i][1].match(cls.varident)){
                let name = arr[i][1].substring(20,arr[i][1].length)
                if(name === 'IT' && this.state.symbol_table[0][1] !== init_value){
                    arr[i][0] = this.state.symbol_table[0][1]
                }
                for (let j = 0; j < this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i][0] && this.state.symbol_table[j][1] !== init_value){
                        arr[i][0] = this.state.symbol_table[j][1]
                    }
                }
            }
            let n
            let temp = []
            /* If a condition operator is found, it will be removed from the array and 
            will be replaced with the final statement */
            if(arr[i][1] === cls.start_cond){
                n = 0
                while(arr[i+n][1]!==cls.end_cond) n++;
                temp = this.solveCondition(arr,i,i+n);
                if(temp !== null){
                    arr.splice(i,n,temp[0]);
                    let j = i + 1;
                    for (let x = 1; x < temp.length; x++) {
                        arr.splice(j,0,temp[x]);   // Replace
                        j++;
                    }
                }
            }
            /* If a switch case operator is found, it will be removed from the array and 
            will be replaced with the final statement */
            if(arr[i][1] === cls.start_switch){
                n = 0
                while(arr[i+n][1]!==cls.end_cond) n++;
                temp = this.solveSwitch(this.findIT(arr),arr,i,i+n);
                console.log(temp)
                if(temp !== null){
                    arr.splice(i,n,temp[0]);
                    let j = i + 1;
                    for (let x = 1; x < temp.length; x++) {
                        arr.splice(j,0,temp[x]);   // Replace
                        j++;
                    }
                }
            }        
        }
        return arr
    }

    /* Find print operations */
    async printOutput(arr){
        let text
        for (let i = 0; i< arr.length; i++) {
            if(arr[i][1].match(cls.output_key)){
                let temp = ""
                let n = 1
                this.setState({text: []})
                while(arr[i+n-1][1] !== "New line"){
                    if(arr[i+n][1] === "New line"){
                        this.state.text.push("\n")
                    }
                    else {
                        /* If variable */
                        if(arr[i+n][1].match(cls.varident)){
                            
                            let name = arr[i+n][1].substring(20,arr[i+n][1].length)
                            if(name === 'IT' && this.state.symbol_table[0][1] !== init_value){
                                arr[i+n][0] = this.state.symbol_table[0][1]
                            } 
                            for (let j = 0; j < this.state.symbol_table.length; j++) {
                                if(this.state.symbol_table[j][0] === arr[i+n][0] && this.state.symbol_table[j][1] !== init_value){
                                    arr[i+n][0] = this.state.symbol_table[j][1]
                                }
                            }
                        }
                        this.state.text.push(arr[i+n][0])
                    }
                    temp += " " + arr[i+n][0]
                    n++
                }
                this.state.symbol_table[0][1] = temp
                text = this.state.text.join(" ")
                text = text.replace(/\n /g,"\n")
                this.props.func1.getText(text); 
            } 
            /* ASK USER INPUT */
            if(arr[i][1].match(cls.input_key)){ 
                document.getElementById("textarea").focus()  // Activate console focus
                // Wait for user input
                let input = await this.props.func2.getInput();
                // Update symbol table
                for (let j = 0; j < this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i+1][0]){
                        this.state.symbol_table[j][1] = input
                    }
                }
                arr[i+1][0] = input
                this.props.func.getSymbols(this.state.symbol_table);
                let temp = []
                arr = this.findExpressions(arr)
                while(true){
                    temp = this.findExpressions(arr)
                    if(arr !== temp) arr = temp;
                    else break
                }
            }
        }
        
    }

    render(){
        return(
            <div></div>
        )
    }
}

export default SemanticAnalyzer;