import React from 'react';
import { Textarea } from "@chakra-ui/react";
import styles from "./Console.module.css";


class Console extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
        }

      }



    componentDidMount(){
        document.getElementById('textarea').value = this.props.data
    }  

    componentDidUpdate(prevProps){
        if(prevProps.data !== this.props.data){
            document.getElementById('textarea').value = this.props.data
        }
    }


    render() {
        return (
            <div className={styles.baseStyles}>
                <h3>CONSOLE</h3>
                <Textarea 
                    id="textarea"
                    className={`input-text ${styles.textArea}`} 
                    size="sm"
                    minHeight={182}
                    variant='filled' 
                    focusBorderColor = "teal"   
                />
            </div>
        )
    }
}

export default Console