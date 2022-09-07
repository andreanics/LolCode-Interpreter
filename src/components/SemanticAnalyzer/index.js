import React from 'react';

const addition_op = "Addition Operator"
const subtraction_op = "Subtraction Operator"
const multiplication_op = "Multiplication Operator"
const division_op = "Division Operator"
const modulo_op = "Modulo Operator"
const greater_than  = "Greater-than Operator"
const less_than = "Less-than Operator"
const equal_op = "Equal Operator"
const not_equal_op = "Not Equal Operator"
const and_op = "AND Operator"
const or_op = "OR Operator"
const xor_op = "XOR Operator"
const not_op = "NOT Operator"

const variable = /Variable Identifier/
const var_decl = "Variable Declaration"
const var_init = "Variable Initialization"
const var_assign = "Variable Assignment"

const print_op = "Output Keyword"
const init_value = ''
const operators = [addition_op,subtraction_op,multiplication_op,division_op,modulo_op,greater_than,less_than,equal_op,not_equal_op,and_op,or_op,xor_op,not_op]

class SemanticAnalyzer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            lexemes: [...this.props.data],
            symbol_table: [["IT",init_value]],
            text: [] 
            
        }
        this.findVariables = this.findVariables.bind(this);
        this.cleanArr = this.cleanArr.bind(this)
        this.solveExpression = this.solveExpression.bind(this);
        this.printOutput = this.printOutput.bind(this);
    }

    componentDidMount(){
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
        this.findVariables(arr)
    }
    findVariables(arr){
        try {
            for (let i = 0; i< arr.length; i++) {
                if(arr[i][1].match(var_decl)  && arr[i+1][1].match(variable)  && arr[i+2][1].match(var_init) && arr[i+3][1].match(/Literal/)){
                    this.state.symbol_table.push([arr[i+1][0], arr[i+3][0]])
                    this.state.symbol_table[0][1] = arr[i+3][0]
                }
                else if(arr[i][1].match(var_decl)  && arr[i+1][1].match(variable)){
                    this.state.symbol_table.push([arr[i+1][0],init_value])
                }
            }
            this.findExpressions(arr)
        } catch (error) {}
        
    }

    findExpressions(arr){ 
        var c, temp,n;
        for (let i = 0; i< arr.length; i++) {
            c = arr[i][1]
            /* If an expression operator is found, it will be removed from the array and 
            will be replaced with the evaluated answer */
            if(operators.includes(c)){
                n = 0
                while(arr[i+n][1]!=="New line") n++;
                temp = this.solveExpression(arr,i,i+n);
                arr.splice(i,n,[temp,"Literal"]);   // Replace
            }
        }
        for (let i = 0; i< arr.length; i++) {
            if(arr[i][1].match(variable)  && arr[i+1][1].match(var_assign) && arr[i+2][1].match(/Literal/)){
                for (let j = 0; j< this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i][0]){
                        this.state.symbol_table[j][1] = arr[i+2][0]
                    }                
                }
            }
            if(arr[i][1].match(var_decl)  && arr[i+1][1].match(variable)  && arr[i+2][1].match(var_init) && arr[i+3][1].match(/Literal/)){
                for (let j = 0; j< this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i+1][0]){
                        this.state.symbol_table[j][1] = arr[i+3][0]
                    }                
                }
            }
            if(arr[i][1].match(variable)){
                for (let j = 0; j < this.state.symbol_table.length; j++) {
                    if(this.state.symbol_table[j][0] === arr[i][0]){
                        arr[i][0] = this.state.symbol_table[j][1]
                    }
                }
            }           
        }

        this.printOutput(arr)
        this.props.func.getSymbols(this.state.symbol_table);
    }
    
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
        str = str.replace(/BOTH OF/g,"&")
        str = str.replace(/EITHER OF/g,"|")
        str = str.replace(/WON OF/g,"#")        // XOR
        str = str.replace(/NOT/g,"!")
        str = str.replace(/BOTH SAEM/g,"===")
        str = str.replace(/DIFFRINT/g,"!==")
        str = str.replace(/AN/g,"")
        str = str.replace(/\s+/g,",")

        // Format String
        let spl = str.split(',')
        if(spl[0] === "max"){
            spl = [ "Math.max( "+ spl[1] + ", " + spl[2] + " )" ]
        }
        else if(spl[0] === "min"){
            spl = [ "Math.min( "+ spl[1] + ", " + spl[2] + " )" ]
        }
        else{
            spl = [ " " + spl[1], spl[0], spl[2] ]
        }
        
        // Convert variables to values
        let str1 = spl.join(' ')
        for (let i = 0; i < this.state.symbol_table.length; i++) {
            str1 = str1.replace(' ' + this.state.symbol_table[i][0], ' ' + this.state.symbol_table[i][1])
            console.log(str1)
        }
        
        // Evaluate answer
        try {
            let ans = eval(str1)
            if(ans !== true && ans !== false){
                ans = Math.round(ans*100) / 100
            }
            this.state.symbol_table[0][1] = ans.toString()        // IT variable
            return ans.toString();       
        } catch (error) {
            return ''
        }      
    }

    printOutput(arr){
        for (let i = 0; i< arr.length; i++) {
            if(arr[i][1].match(print_op)){
                let temp = ""
                let n = 1
                while(arr[i+n-1][1] !== "New line"){
                    if(arr[i+n][1] === "New line"){
                        this.state.text.push("\n")
                    }
                    else this.state.text.push(arr[i+n][0])
                    temp += " " + arr[i+n][0]
                    n++
                }
                this.state.symbol_table[0][1] = temp

            } 
        }
        let text = this.state.text.join(" ")
        text = text.replace(/\n /g,"\n")
        this.props.func1.getText(text);
    }

    render(){
        return(
            <div></div>
        )
    }
}

export default SemanticAnalyzer;