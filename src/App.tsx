import {memo, ReactNode, useEffect, useState} from 'react'
import './App.css'
import {db} from "./components/connection.tsx";
import {onValue, push, ref, set} from "firebase/database";
import {Table, TableContainer, Tbody, Td, Th, Thead, Tr,} from '@chakra-ui/table'
import {Box} from "@chakra-ui/layout";
import {Button, Flex, FormControl, FormLabel, InputGroup, Textarea, useToast} from "@chakra-ui/react";

interface Question {
	id: string;
	question: string;
	answer: string;
}

const QuestionsTable = memo(({data}: { data: Question[] }): ReactNode => {
	const [filter, setFilter] = useState('');

	const filteredData = data.filter(question => question.question.toLowerCase().startsWith(filter.toLowerCase()));

	return (
		<Flex w="100%" direction="column" bg="white" boxShadow="md" borderRadius="md" p={5} h="100%" color="black"
		      gap={4}>
			<Flex w="100%" justify="center" align="center">
				<InputGroup>
					<Textarea
						rows={10}
						placeholder="Search"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
					/>
				</InputGroup>
			</Flex>
			<TableContainer w="100%" h="100%" overflowY="auto">
				<Table variant="simple" colorScheme="black">
					<Thead>
						<Tr>
							<Th fontSize="lg">Question</Th>
							<Th fontSize="lg">Answer</Th>
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
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
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

	return (
		<Flex
			bg="gray.200"
			minH="100vh"
			minW="100vw"
			overflow="hidden"
			direction="column"
			justify="center"
			align="center"  // Center the content horizontally
			m={0}
			p={5}
		>
			<Flex
				w="90%"
				h="100%"
				direction="column"
				bg="gray.200"
				overflowY="auto"
				gap={4}
			>
				<Flex w="100%" direction="row" bg="white" borderRadius="md" boxShadow="md" color="black">
					<Flex direction="row" gap={4} w="80%" p={5}>
						<FormControl isRequired>
							<FormLabel>Question</FormLabel>
							<Textarea placeholder="Question" onChange={(e) => setQuestion(e.target.value)}/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel>Answer</FormLabel>
							<Textarea placeholder="Answer" onChange={(e) => setAnswer(e.target.value)}/>
						</FormControl>
					</Flex>
					<Flex w="20%" justify="center" align="center">
						<Button
							variant="ghost"
							isDisabled={question === '' || answer === ''}
							onClick={addQuestion}
						>Save</Button>
					</Flex>
				</Flex>
				{
					data ? <QuestionsTable data={data}/> : <Box>No data</Box>
				}
			</Flex>
		</Flex>
	)
});

export default App
