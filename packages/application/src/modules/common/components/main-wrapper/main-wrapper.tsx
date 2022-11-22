import {
    Avatar,
    BodyText,
    Icon,
    Layout,
    Page,
    Sidebar,
    SideNav,
    Stack,
} from '@servicetitan/design-system';
import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import * as Styles from './main-wrapper.module.less';
import { useDependencies } from '@servicetitan/react-ioc';
import { AuthStore } from '../../stores/auth.store';
import { observer } from 'mobx-react';
import { getAvatarFirstLetters, urlToShow } from '../../utils/url-helpers';

export const MainWrapper: FC = observer(({ children }) => {
    const [{ user }] = useDependencies(AuthStore);

    return (
        <Page
            maxWidth="wide"
            style={{ height: '100%' }}
            className={Styles.mainRoot}
            actionToolbar={{
                sticky: true,
                content: (
                    <Stack style={{ flex: 1 }} justifyContent="space-between">
                        <Stack.Item>{/*  */}</Stack.Item>
                        <Stack justifyContent="center" alignItems="center">
                            <Avatar
                                name={getAvatarFirstLetters(user?.name)}
                                autoColor
                                image={urlToShow(user?.profilePictureUrl)}
                            />
                            <BodyText className="p-l-1 t-truncate" size="medium">
                                {user?.name}
                            </BodyText>
                        </Stack>
                    </Stack>
                ),
            }}
            sidebar={<MySideBar />}
        >
            <Layout>{children}</Layout>
        </Page>
    );
});

const MySideBar: FC = observer(() => {
    const [{ isAdmin, isUser }] = useDependencies(AuthStore);
    const [activeRoute, setActiveRoute] = useState(1);

    const isActive = useCallback(
        route => {
            return route === activeRoute;
        },
        [activeRoute]
    );

    return (
        <Sidebar localStorageKey="" className={Styles.sidebar}>
            <Icon iconName="odometer" />
            <Sidebar.Section>
                <SideNav>
                    <Link
                        onClick={() => {
                            setActiveRoute(1);
                        }}
                        to="/"
                    >
                        <SideNav.Item active={isActive(1)}>
                            <Icon name="import_contacts" className="m-r-1 m-b-half" />
                            Բոլոր գրքերը
                        </SideNav.Item>
                    </Link>
                    {isUser && (
                        <Link
                            to="/my-books"
                            onClick={() => {
                                setActiveRoute(2);
                            }}
                        >
                            <SideNav.Item active={isActive(2)}>
                                <Icon name="library_books" className="m-r-1 m-b-half" />
                                Իմ գրքերը
                            </SideNav.Item>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link
                            to="/contacts"
                            onClick={() => {
                                setActiveRoute(3);
                            }}
                        >
                            <SideNav.Item active={isActive(3)}>
                                <Icon name="library_books" className="m-r-1" />
                                Կոնտակտներ{' '}
                            </SideNav.Item>
                        </Link>
                    )}
                </SideNav>
            </Sidebar.Section>
            <Sidebar.Section className={Styles.sidebarMainSection}>
                <SideNav className={Styles.myAccountNav}>
                    <Link
                        to="/account"
                        onClick={() => {
                            setActiveRoute(4);
                        }}
                    >
                        <SideNav.Item active={isActive(4)}>
                            <Icon name="face" className="m-r-1 m-b-half" />
                            Իմ հաշիվը
                        </SideNav.Item>
                    </Link>
                </SideNav>
                <SideNav>
                    <Link
                        to="/logout"
                        onClick={() => {
                            setActiveRoute(5);
                        }}
                    >
                        <SideNav.Item active>
                            <Icon name="call_missed_outgoing" className="m-r-1 m-b-half" />
                            Դուրս գալ
                        </SideNav.Item>
                    </Link>
                </SideNav>
            </Sidebar.Section>
        </Sidebar>
    );
});
