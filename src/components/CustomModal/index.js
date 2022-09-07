import React from 'react';
import styles from './CustomModal.module.css';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Input,
} from '@chakra-ui/react';

function CustomModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            <button onClick={onOpen} className={`button-text ${styles.buttonBaseStyles1}`}>Enter Input</button>
            <Modal
                isCentered
                onClose={onClose}
                isOpen={isOpen}
                motionPreset='slideInBottom'
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader >Enter Input</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input variant='filled'>
                        </Input>
                    </ModalBody>
                    <ModalFooter>
                        <button onClick={onClose} className={`button-text ${styles.buttonBaseStyles2}`}>
                            Enter
                        </button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default CustomModal;