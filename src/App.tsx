import {memo, ReactNode, useEffect, useState} from 'react'
import './App.css'
import {db} from "./components/connection.tsx";
import {onValue, push, ref, set} from "firebase/database";
import {Table, TableContainer, Tbody, Td, Th, Thead, Tr,} from '@chakra-ui/table'
import {Box} from "@chakra-ui/layout";
import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Grid,
	InputGroup,
	InputLeftAddon,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Textarea,
	useDisclosure,
	useToast
} from "@chakra-ui/react";
import {DeleteIcon, EditIcon, SearchIcon} from "@chakra-ui/icons";

interface Question {
	id: string;
	question: string;
	answer: string;
}

const QuestionsTable = memo(({data}: { data: Question[] }): ReactNode => {
	const [filter, setFilter] = useState('');
	const [editQuestion, setEditQuestion] = useState<Question | null>(null);
	const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null);
	const filteredData = data.filter(question => question.question.toLowerCase().startsWith(filter.toLowerCase()));
	const {isOpen, onOpen, onClose} = useDisclosure()
	const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure()
	const toast = useToast();

	const closeEditModal = () => {
		setEditQuestion(null);
		onClose();
	}

	const openEditModal = (question: Question) => {
		setEditQuestion(question);
		onOpen();
	}

	const closeDeleteModal = () => {
		setDeleteQuestion(null);
		onDeleteClose();
	}

	const openDeleteModal = (question: Question) => {
		setDeleteQuestion(question);
		onDeleteOpen();
	}

	const editQuestionHandler = () => {
		const questionRef = ref(db, editQuestion?.id);

		set(questionRef, {
			question: editQuestion?.question,
			answer: editQuestion?.answer,
		}).then(r => {
			console.log('Updated', r);
			toast({
				title: "Question updated.",
				description: "Your question has been updated.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			closeEditModal();
		});
	}

	const deleteQuestionHandler = () => {
		const questionRef = ref(db, deleteQuestion?.id);

		set(questionRef, null).then(r => {
			console.log('Deleted', r);
			toast({
				title: "Question deleted.",
				description: "Your question has been deleted.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			closeDeleteModal();
		});
	}

	return (
		<Box w="100%" bg="white" boxShadow="md" borderRadius="md" h="100%" p={5} color="black">
			<Box w="100%" h="10%">
				<Flex w="100%" justify="center" align="center">
					<InputGroup>
						<InputLeftAddon pointerEvents="none" children={<SearchIcon color="black"/>}/>
						<Textarea
							rows={1}
							placeholder="Search"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
						/>
					</InputGroup>
				</Flex>
			</Box>
			<Box w="100%" h="90%" overflowY="auto">
				<TableContainer w="100%" fontSize="sm">
					<Table variant="simple" colorScheme="black">
						<Thead>
							<Tr>
								<Th fontSize="lg">Question</Th>
								<Th fontSize="lg">Answer</Th>
								<Th fontSize="lg">Actions</Th>
							</Tr>
						</Thead>
						<Tbody>
							{filteredData.map((question) => (
								<Tr key={question.id}>
									<Td whiteSpace="pre-wrap">
										{question.question}
									</Td>
									<Td whiteSpace="pre-wrap">
										{question.answer}
									</Td>
									<Td>
										<Flex direction="row" gap={4}>
											<EditIcon color="blue.500" boxSize={5} cursor="pointer"
											          onClick={() => openEditModal(question)}/>
											<DeleteIcon
												color="red.500"
												boxSize={5}
												cursor="pointer"
												onClick={() => openDeleteModal(question)}
											/>
										</Flex>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</TableContainer>
			</Box>
			<Modal isOpen={isOpen} onClose={closeEditModal} size="3xl">
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Edit Question</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<FormControl isRequired>
							<FormLabel>Question</FormLabel>
							<Textarea
								rows={10}
								placeholder="Question" value={editQuestion?.question}
								onChange={
									(e) => setEditQuestion(editQuestion ?
										{
											...editQuestion,
											question: e.target.value
										} : null
									)
								}
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel>Answer</FormLabel>
							<Textarea
								rows={10}
								placeholder="Answer" value={editQuestion?.answer}
								onChange={
									(e) => setEditQuestion(editQuestion ?
										{
											...editQuestion,
											answer: e.target.value
										} : null
									)
								}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeEditModal}>
							Close
						</Button>
						<Button
							colorScheme="blue"
							isDisabled={editQuestion?.answer === '' || editQuestion?.question === ''}
							onClick={editQuestionHandler}
						>
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Modal isOpen={isDeleteOpen} onClose={closeDeleteModal}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Delete Question</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						Are you sure you want to delete this question?
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeDeleteModal}>
							Close
						</Button>
						<Button colorScheme="red" onClick={deleteQuestionHandler}>
							Delete
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	)
});

const AddQuestionAnswer = memo(({question, answer, setQuestion, setAnswer, addQuestion}: {
	question: string,
	answer: string,
	setQuestion: (question: string) => void,
	setAnswer: (answer: string) => void,
	addQuestion: () => void
}): ReactNode => {
	return (
		<Flex w="100%" direction="row" bg="white" borderRadius="md" boxShadow="md" color="black" justify="center"
		      align="center">
			<Flex direction="row" gap={4} w="90%" p={5}>
				<FormControl isRequired>
					<FormLabel>Question</FormLabel>
					<Textarea
						placeholder="Question"
						rows={4}
						value={question}
						onChange={(e) => {
							setQuestion(e.target.value)
						}}
					/>
				</FormControl>
				<FormControl isRequired>
					<FormLabel>Answer</FormLabel>
					<Textarea
						placeholder="Answer"
						rows={4}
						value={answer}
						onChange={(e) => {
							setAnswer(e.target.value)
						}}
					/>
				</FormControl>
			</Flex>
			<Flex w="10%" justify="center" align="center">
				<Button
					variant="ghost"
					isDisabled={question === '' || answer === ''}
					onClick={addQuestion}
				>Save</Button>
			</Flex>
		</Flex>
	)
});

const App = memo(() => {
	const [data, setData] = useState(null as Question[] | null);

	useEffect(() => {
		const dbRef = ref(db);
		onValue(dbRef, (snapshot) => {
			const data: Question[] = [];

			snapshot.forEach((childSnapshot) => {
				data.push({
					id: childSnapshot.key,
					question: childSnapshot.val().question,
					answer: childSnapshot.val().answer,
				});
			});

			if (data?.length > 0) {
				setData(data);
			} else {
				setData(null);
			}
		});
	}, []);
	const [question, setQuestion] = useState('')
	const [answer, setAnswer] = useState('')
	const toast = useToast();

	const addQuestion = () => {
		// Check if the question already exists
		const questionExists = data?.some(existingQuestion => existingQuestion.question === question);
		console.log('questionExists', questionExists);

		if (questionExists) {
			// If the question exists, show a toast message and return early
			toast({
				title: "Question already exists.",
				description: "Please enter a new question.",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const dbRef = ref(db);
		const newQuestionRef = push(dbRef);

		set(newQuestionRef, {
			question: question,
			answer: answer,
		}).then(r => {
			console.log('Added', r);
			toast({
				title: "Question added.",
				description: "Your question has been added.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			setQuestion('');
			setAnswer('');
		});
	}

	useEffect(() => {
		console.log('question', question);
		console.log('answer', answer);
	}, [question, answer]);

	return (
		<Box
			bg="gray.200"
			minH="100vh"
			minW="100vw"
			h="100vh"
			align="center"
			overflow="hidden"
			m={0}
			p={5}
		>
			<Grid
				templateRows="20% 80%"
				w="95%"
				h="95%"
				gap={5}
			>
				<AddQuestionAnswer
					question={question}
					answer={answer}
					setQuestion={setQuestion}
					setAnswer={setAnswer}
					addQuestion={addQuestion}
				/>
				{
					data ? <QuestionsTable data={data}/> : <Box>No data</Box>
				}
			</Grid>
		</Box>
	)
});

export default App
