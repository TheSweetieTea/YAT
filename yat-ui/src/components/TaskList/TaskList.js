import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {ReactComponent as Square} from "../../icons/square.svg";
import {ReactComponent as SquareCheck} from "../../icons/check-square.svg";
import {ReactComponent as SquareX} from "../../icons/x-square.svg";
import {ReactComponent as X} from "../../icons/x-lg.svg";
import {ReactComponent as Clock} from "../../icons/clock.svg";
import {ReactComponent as Star} from "../../icons/star.svg";

import Auth from '../../pkg/auth';
import '../../App.css';
import TaskForm from "../TaskForm/TaskForm";
import TagsFilter from "../TagsFilter/TagsFilter";
// import TaskFinish from "../TaskFinish/TaskFinish";

const iconComponents = {
    "done": SquareCheck,
    "not done": Square,
    "failed": SquareX,
};

const TaskList = ({created, finished, done, onMain}) => {
    const [tasks, setTasks] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [factors, setFactors] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() returns month index starting from 0
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    useEffect(() => {
        Auth.axiosInstance.get('/api/v1/homepage/tasks/', {
            params: {
                "created": created,
                "finished": finished,
                "tags": [],
                "status": done,
            }
        })
            .then(response => {
                setTasks(response.data.tasks);
            })
            .catch(error => {
                console.error(error);
            })
    }, [created, finished, done, isFormOpen]);

    useEffect(() => {
        Auth.axiosInstance.get('/api/v1/homepage/tags/')
            .then(response => {
                    const newTags = response.data.tags.map(tag => ({
                        ...tag,
                        id: tag.id,
                        name: tag.name,
                        checked: false,
                    }));
                    setTags(newTags);
                }
            )
            .catch(error => {
                console.error(error);
            })
    }, []);

    useEffect(() => {
        setSelectedTags(tags.filter(tag => tag.checked).map(tag => tag.id));
    }, [tags]);

    useEffect(() => {
        Auth.axiosInstance.get('/api/v1/homepage/factors/')
            .then(response => {
                    const new_factors = response.data.factors.reduce((acc, factor) => ({
                        ...acc,
                        [factor.id]: factor.name,
                    }), {});
                    setFactors(new_factors);
                }
            )
            .catch(error => {
                console.error(error);
            })
    }, []);

    return (
        <div style={{border: '1px solid lightgrey', borderRadius: '10px', marginRight: '10px'}}>
            <Modal
                isOpen={isFilterOpen}
                onRequestClose={() => setIsFilterOpen(false)}
                style={{
                    content: {
                        width: '40%',
                        height: '80%',
                        margin: 'auto',
                    }
                }}
            >
                <TagsFilter tags={tags} onTagSelection={setSelectedTags} closeModal={() => setIsFilterOpen(false)}/>
            </Modal>

            {/*<Modal*/}
            {/*    isOpen={isFormOpen}*/}
            {/*    onRequestClose={() => setIsFormOpen(false)}*/}
            {/*    style={{*/}
            {/*        content: {*/}
            {/*            width: '40%',*/}
            {/*            height: '80%',*/}
            {/*            margin: 'auto',*/}
            {/*        }*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <TaskForm task={selectedTask} tags={tags} closeModal={() => setIsFormOpen(false)}/>*/}
            {/*</Modal>*/}

            {/*<Modal*/}
            {/*    isOpen={isCardOpen}*/}
            {/*    onRequestClose={() => setIsCardOpen(false)}*/}
            {/*    style={{*/}
            {/*        content: {*/}
            {/*            width: '55%',*/}
            {/*            height: '75%',*/}
            {/*            margin: 'auto',*/}
            {/*        }*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <TaskForm task={selectedTask} tags={tags} closeModal={() => setIsFormOpen(false)}/>*/}
            {/*</Modal>*/}

            <Modal
                isOpen={isFormOpen}
                onRequestClose={() => {
                    setIsFormOpen(false)
                    setSelectedTask(null)
                }}
                style={{
                    content: {
                        width: '40%',
                        height: '80%',
                        margin: 'auto',
                    }
                }}
            >
                <TaskForm task={selectedTask} tags={tags} closeModal={() => {
                    setIsFormOpen(false)
                    setSelectedTask(null)}}/>
            </Modal>

            {/*<Modal*/}
            {/*    isOpen={isFinished}*/}
            {/*    onRequestClose={() => setFinished(false)}*/}
            {/*    style={{*/}
            {/*        content: {*/}
            {/*            width: '40%',*/}
            {/*            height: '80%',*/}
            {/*            margin: 'auto',*/}
            {/*        }*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <TaskForm task={selectedTask} tags={tags} closeModal={() => setIsFormOpen(false)}/>*/}
            {/*</Modal>*/}

            <div className="header">
                <h2 style={{marginTop: '10px'}}>Задачи</h2>
            </div>
            <div className="buttons">
                {onMain &&
                    <button className="button-green button-gap" onClick={() => setIsFormOpen(true)}>Добавить задачу
                    </button>}
                <button className="button-orange button-gap" onClick={() => setIsFilterOpen(true)}>Фильтр по тегам
                </button>
                {Boolean(selectedTags.length !== 0) && <button className="button-orange button-gap" onClick={() => {
                    setSelectedTags([]);
                    setTags(tags.map(tag => ({...tag, checked: false})));
                }}>
                    {tags.filter(tag => tag.checked).map(tag => tag.name).join(', ')}
                    <X fill="red"/>
                </button>}
            </div>

            <div className="event-container">
                {tasks
                    .filter(task => selectedTags.length === 0 || selectedTags
                        .every(tagId => task.tags.includes(tagId)))
                    .map((task, index) => {
                        const currentDate = new Date();
                        const deadlineDate = new Date(task.deadline * 1000); // Convert to milliseconds as JavaScript Date object takes time in milliseconds

                        const IconComponent = iconComponents[task.status] || Star;
                        const factorMean = task.factors.reduce((sum, factor) => sum + factor.value, 0) / task.factors.length;
                        const factorColor = factorMean > 5 ? 'green' : factorMean < -5 ? 'red' : 'black';

                        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

                        const diffTime = Math.abs(deadlineDate - currentDate);
                        const diffDays = Math.ceil(diffTime / oneDay);

                        const deadlineColor = diffDays <= 1 ? 'red' : 'black';
                        return (
                            <div key={task.id} className="event-card" onClick={() => {
                                setSelectedTask(task);
                                setIsFormOpen(true);
                            }}>
                                <div className="text-with-icon">
                                    <IconComponent className="icon-fixed-size"/>
                                    <h4>{task.name}</h4>
                                </div>

                                {Boolean(task.finished) && <div>
                                    <div className="text-with-icon">
                                        <Clock className="icon-fixed-size"/>
                                        <span>{formatTime(task.deadline)}</span>
                                    </div>

                                    <div className="text-with-icon factor-right">
                                        <Star fill={factorColor} className="icon-fixed-size"/>
                                        <span style={{color: factorColor}}>{factorMean}</span>
                                    </div>
                                </div>}

                                {task.deadline && <div>
                                    <div className="text-with-icon">
                                        <Clock fill={deadlineColor} className="icon-fixed-size"/>
                                        <span style={{color: deadlineColor}}>{formatTime(task.deadline)}</span>
                                    </div>
                                </div>}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
};

export default TaskList;