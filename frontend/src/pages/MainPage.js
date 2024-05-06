import React, {useState} from "react";
import Plot from 'react-plotly.js';
import StyledInput from "../components/input";
import Select from "../components/select";
import Checkbox from "../components/checkbox";
import SelectMulti from "../components/select_checkbox";
import Button from "../components/Button";
import axios from 'axios';
import {DotLoader} from "react-spinners";
import {ReactComponent as ReactLogo} from '../svgs/BAUM_AI_P-05.svg'
import Error from "../components/error";
import TextArea from "../components/textArea";


export function MainPage() {
    const [loader, setLoader] = useState(false)
    const [sigh, setSigh] = useState('time')
    const [param, setParam] = useState([{key: 'System', cat: 'Array'}])
    const [isParam, setIsParam] = useState(false)
    const [sighParam, setSighParam] = useState('Capacity usage(%)')
    const [window, setWindow] = useState('auto_interval')
    const [level, setLevel] = useState([{key: 'LEVEL0', cat: 'Уровень 0'}])
    const [storagePool, setStoragePool] = useState(false)
    const [global, setGlobal] = useState(false)
    const [cloud, setCloud] = useState(false)
    const [interval, setInterval] = useState('Месяц')
    const [intervalNum, setIntervalNum] = useState(1)
    const [data, setData] = useState()
    const [error, setError] = useState(false)
    const [sqlRequest, setSqlRequest] = useState('select * from real_data')
    const [isSqlRequest, setIsSqlRequest] = useState(false)
    const [isSqlRequestLevel, setIsSqlRequestLevel] = useState(false)
    const [sqlRequestLevel, setSqlRequestLevel] = useState('UPDATE level SET "LEVEL0" = 50 WHERE object = \'Array2 SP1\'')
    const [revision, setRevision] = useState(0)
    const handleChangeParam = (selected) => {
        setParam(selected);
        const isHas = param.some(item => item.key === 'System')
        setIsParam(!isHas)
        if (!isHas){
            setStoragePool(false)
        }
    };
    const handleChangeLevel = (selected) => {
        setLevel(selected);
    };
    const handleChangeStoragePool= () => {
        setStoragePool(prevState => !prevState); // Передаем функцию в setState, которая получает предыдущее состояние и возвращает новое
    };
    const handleChangeCloud= () => {
        setCloud(prevState => !prevState); // Передаем функцию в setState, которая получает предыдущее состояние и возвращает новое
    };
    const handleChangeGlobal= () => {
        setGlobal(prevState => !prevState); // Передаем функцию в setState, которая получает предыдущее состояние и возвращает новое
    };

    const handleChangeViewTextArea = (e) => {
        setIsSqlRequest(prevState => !prevState)
    }
    const handleChangeViewTextArea2 = (e) => {
        setIsSqlRequestLevel(prevState => !prevState)
    }

    const [plotData, setPlotData] = useState(null);



    const handleClick = async () => {
        setLoader(true)
        await axios.post('http://localhost:8008/api/get_graph', {
            sqlRequest: sqlRequest,
            sqlRequestLevel: sqlRequestLevel,
            isSqlRequestLevel: isSqlRequestLevel,
            param: param,
            sigh: sigh,
            target: sighParam,
            sp_flag: storagePool,
            select_window_type: window,
            dropdown_block: {
                find_global: global,
                interval: interval,
                interval_num: intervalNum
            },
            levels_list: level,
            use_cloud: cloud,
        }).then((response) => {
            let plot = JSON.parse(response.data.plot[0].fig)
            plot.layout.xaxis.type = 'date'
            plot.data.forEach(item => {
              item.visible = null;
            });
            plot.data[0].visible = null
            setData(plot)
            console.log(plot)
            setLoader(false)
            setError(false)
        }).catch((error) => {
            console.log(error)
            if (error.message){
                setError(error.message)
            }
            else {
                setError(error.response.data.detail)
            }
            setData({data: '', layout: ''})
        }).finally(() => {
            setRevision(1)
        })
    }
    console.log('data rerender', data)
    return(
        <div>
            <ReactLogo style={{color: '#5558FA', width: '500px', height: 'auto', marginLeft: '30px'}}/>

            <div className="main-page-container">
                {!loader && data && <div className='graph'>
                    <Plot
                        data={data.data}
                        layout={data.layout}

                    />
                </div>}
                <div>
                    <div className="input-div">
                        <SelectMulti options={[
                            {key: 'System', cat: 'Array'},
                            {key: 'StoragePool001', cat: 'StoragePool1'},
                            {key: 'StoragePool002', cat: 'StoragePool2'},
                        ]} handleChange={handleChangeParam} title='Параметры' state={[{key: 'System', cat: 'Array'}]}/>
                    </div>
                    <div className="input-div">
                        <Checkbox title='Показывать SQL запрос для БД' type='checkbox'
                                  value={isSqlRequest} onChange={handleChangeViewTextArea}/>
                    </div>
                    {isSqlRequest && <div className="input-div">
                        <TextArea children='SQL запрос для БД' value={sqlRequest}
                                  onChange={(event) => setSqlRequest(event.target.value)}/>
                    </div>}
                    <div className="input-div">
                        <Checkbox title='SQL запрос для Level' type='checkbox'
                                  value={isSqlRequestLevel} onChange={handleChangeViewTextArea2}/>
                    </div>
                    {isSqlRequestLevel && <div className="input-div">
                        <TextArea children='SQL запрос для уровней' value={sqlRequestLevel}
                                  onChange={(event) => setSqlRequestLevel(event.target.value)}/>
                    </div>}
                    <div className="input-div">
                        <StyledInput children='Признаки' value={sigh}
                                     onChange={(event) => setSigh(event.target.value)}/>
                    </div>
                    <div className="input-div">
                        <StyledInput children='Целевые признаки' value={sighParam}
                                     onChange={(event) => setSighParam(event.target.value)}/>
                    </div>
                    <div className="input-div">
                        <Select children={[
                            {value: 'auto_interval', label: '1. Автоматический'},
                            {value: 'advanced_interval', label: '2. Ручной (продвинутый)'},
                        ]} title='Режим выбора окна' value={window}
                                onChange={(event) => setWindow(event.target.value)}/>
                    </div>
                    {window === 'advanced_interval' && <div>
                        <div className="input-div">
                            <Select children={[
                                {value: 'День', label: 'День'},
                                {value: 'Неделя', label: 'Неделя'},
                                {value: 'Месяц', label: 'Месяц'},
                                {value: 'Год', label: 'Год'},
                            ]} title='Интервал' value={interval} onChange={(event) => setInterval(event.target.value)}/>
                        </div>
                        <div className="input-div">
                            <StyledInput children='Количество интервалов' value={intervalNum}
                                         onChange={(event) => setIntervalNum(event.target.value)}/>
                        </div>
                    </div>
                    }
                    <div className="input-div">
                        <SelectMulti options={[
                            {key: 'LEVEL0', cat: 'Уровень 0'},
                            {key: 'LEVEL1', cat: 'Уровень 1'},
                            {key: 'LEVEL2', cat: 'Уровень 2'},
                        ]} handleChange={handleChangeLevel} title='Предсказание для'
                                     state={[{key: 'LEVEL0', cat: 'Уровень 0'}]}/>
                    </div>
                    {!isParam && <div className="input-div">
                        <Checkbox title='Использовать для прогноза StoragePool' type='checkbox'
                                  value={storagePool} onChange={handleChangeStoragePool}/>
                    </div>}
                    {window === 'auto_interval' && <div className="input-div">
                        <Checkbox title='find_global' type='checkbox'
                                  value={global} onChange={handleChangeGlobal}/>
                    </div>}
                    <div className="input-div">
                        <Checkbox title='Облако точек' type='checkbox'
                                  value={cloud} onChange={handleChangeCloud}/>
                    </div>
                    <div className="input-div">
                        {error && <Error style={{marginLeft: '0'}}>{error}</Error>}
                        {error && <Button children='Визуализировать' onClick={handleClick}/>}
                        {!loader && !error && <Button children='Визуализировать' onClick={handleClick}/>}
                        {loader && !error && <DotLoader color='#5558FA'/>}
                    </div>
                </div>
            </div>
        </div>
    )
}