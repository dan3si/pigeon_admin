import { useEffect, useState } from 'react'
import { API_URL } from '../../settings'
import cities from '../../data/cities'
import Select from 'react-select'
import LoadingAnimation from '../../components/LoadingAnimation'
import styles from './Routes.module.scss'
import arrowIcon from '../../images/icons/arrow.png'
import bucketIcon from '../../images/icons/bucket.png'

const Routes = () => {
    const citySelectOptions = [
        { value: '', label: 'Не выбрано' },
        ...cities.map(city => ({ value: city, label: city }))
    ]

    const [routes, setRoutes] = useState([])
    const [routesAreLoading, setRoutesAreLoading] = useState(false)
    const [from, setFrom] = useState(citySelectOptions[0])
    const [to, setTo] = useState(citySelectOptions[0])
    const [idToDelete, setIdToDelete] = useState('')
    const [deleteConfirmPopupIsShown, setDeleteConfirmPopupIsShown] = useState(false)
    const [pass, setPass] = useState('')

    const getRoutes = async () => {
        setRoutesAreLoading(true)

        try {
            const res = await fetch(`${API_URL}/routes?from=${from.value}&to=${to.value}`)
            const data = await res.json()
            setRoutes(data)
        } catch {
            alert('Ошибка! Не удалось загрузить маршруты, попробуйте позже')
        } finally {
            setRoutesAreLoading(false)
        }
    }

    const formatDate = (date) => {
        const months = {
            '01': 'января',
            '02': 'февраля',
            '03': 'марта',
            '04': 'апреля',
            '05': 'мая',
            '06': 'июня',
            '07': 'июля',
            '08': 'августа',
            '09': 'сентября',
            '10': 'октября',
            '11': 'ноября',
            '12': 'декабря',
        }

        const [year, month, day] = date.split('-')

        return `${day} ${months[month]} ${year}`
    }

    useEffect(() => {
        getRoutes()
    }, [from, to])

    if (routesAreLoading) {
        return (
            <div className={styles.routes}>
                <LoadingAnimation />
            </div>
        )
    }

    return (
        <div className={styles.routes}>
            <div className={styles.routeSelectsWrapper}>
                <Select
                    className={styles.routeSelect}
                    options={citySelectOptions}
                    placeholder="Город отправления:"
                    value={from}
                    onChange={value => setFrom(value)}
                />

                <div className={styles.routeArrowWrapper}>
                    <img
                        className={styles.routeArrow}
                        src={arrowIcon}
                    />
                </div>

                <Select
                    className={styles.routeSelect}
                    options={citySelectOptions}
                    placeholder="Город прибытия:"
                    value={to}
                    onChange={value => setTo(value)}
                />
            </div>

            <div className={styles.passWrapper}>
                <input
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                />
            </div>

            <div className={styles.routesWrapper}>
                {routes.map(({ id, from, to, date, name, phone, note }) => (
                    <div key={id} className={styles.route}>
                        <div className={styles.row}>
                            <div className={styles.field}>ID: {id}</div>
                            <button className={styles.deleteRouteBtn}>
                                <img
                                    src={bucketIcon}
                                    className={styles.deleteRouteBtnIcon}
                                    onClick={() => {
                                        setIdToDelete(id)
                                        setDeleteConfirmPopupIsShown(true)
                                    }}
                                />
                            </button>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>Откуда: {from}</div>
                            <div className={styles.field}>Куда: {to}</div>
                        </div>
                        
                        <div className={styles.row}>
                            <div className={styles.field}>Дата: {formatDate(date)}</div>
                        </div>
                        
                        <div className={styles.row}>
                            <div className={styles.field}>Имя: {name}</div>
                            <div className={styles.field}>
                                <a
                                    href={'tel: ' + phone}
                                    className={styles.phoneLink}
                                >
                                    Телефон: {phone}
                                </a>
                            </div>
                        </div>

                        {note !== '' && (
                            <div className={styles.row}>
                                <div className={styles.field}>Примечание: {note}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {deleteConfirmPopupIsShown && (
                <div
                    className={styles.deleteConfirmationPopupDarkener}
                    onClick={() => setDeleteConfirmPopupIsShown(false)}
                >
                    <div
                        className={styles.deleteConfirmationPopup}
                        onClick={e => e.stopPropagation()}
                    >
                        Вы уверены что хотите удалить маршрут #{idToDelete} ?
                        <div className={styles.deleteConfirmationPopupBtnsWrapper}>
                            <button
                                className={styles.deleteConfirmationPopupBtn}
                                onClick={async () => {
                                    if (!idToDelete) {
                                        return
                                    }

                                    const res = await fetch(`${API_URL}/routes/${idToDelete}`, {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json'},
                                        body: JSON.stringify({ pass })
                                    })
                                    const data = await res.text()
                                    
                                    if (data !== 'success') {
                                        alert('Ошибка, маршрут не был удалён')
                                    }

                                    setIdToDelete('')
                                    setDeleteConfirmPopupIsShown(false)
                                    getRoutes()
                                }}
                            >
                                Да
                            </button>
                            <button
                                className={styles.deleteConfirmationPopupBtn}
                                onClick={() => {
                                    setDeleteConfirmPopupIsShown(false)
                                    setIdToDelete('')
                                }}
                            >
                                Нет
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Routes
