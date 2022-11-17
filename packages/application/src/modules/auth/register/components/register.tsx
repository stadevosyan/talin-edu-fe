import { FC } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { Form, ButtonGroup, Button, Page, Headline, Divider } from '@servicetitan/design-system';

import { Label } from '@servicetitan/form';
import { BackTo } from '../../components/back-to/back-to';
import { AuthPaths } from '../../../common/utils/paths';
import { observer } from 'mobx-react';
import * as Styles from './register.module.less';
import { SignUpStore } from '../../stores/sign-up.store';

export const Register: FC<RouteComponentProps> = provide({ singletons: [SignUpStore] })(
    observer(() => {
        const [registerStore] = useDependencies(SignUpStore);

        const {
            form: {
                $: { name, email, password, phoneNumber },
            },
        } = registerStore;

        return (
            <Page maxWidth="narrow" footer={<Footer />}>
                <div className={Styles.backToSection}>
                    <BackTo />
                </div>
                <Headline el="div" className="m-b-4" size="large">
                    Ստեղծել նոր հաշիվ
                </Headline>

                <Divider spacing="5" />

                <Form className={Styles.form}>
                    {/* image upload here*/}

                    <Form.Input
                        label={<Label label="Անուն Ազգանուն" hasError={name.hasError} />}
                        value={name.value}
                        onChange={name.onChangeHandler}
                        error={name.error}
                    />

                    <Form.Input
                        label={<Label label="Էլեկտրոնային հասցե" hasError={email.hasError} />}
                        value={email.value}
                        onChange={email.onChangeHandler}
                        error={email.error}
                    />

                    <Form.Input
                        label={<Label label="Հեռախոսահամար" hasError={phoneNumber.hasError} />}
                        value={phoneNumber.value}
                        onChange={phoneNumber.onChangeHandler}
                        error={phoneNumber.error}
                    />

                    <Form.Input
                        label={<Label label="Ստեղծել գաղտնաբառ" hasError={password.hasError} />}
                        value={password.value}
                        onChange={password.onChangeHandler}
                        error={password.error}
                        type="password"
                    />
                </Form>
            </Page>
        );
    })
);

const Footer = () => {
    const [registerStore] = useDependencies(SignUpStore);

    const history = useHistory();

    const handleSubmit = async () => {
        const isSuccessful = await registerStore.register();

        if (isSuccessful) {
            history.push(AuthPaths.login);
        }
    };

    return (
        <div className="m-l-auto">
            <ButtonGroup>
                <Button small color="grey" href={AuthPaths.login}>
                    Չեղարկել
                </Button>
                <Button small primary onClick={handleSubmit}>
                    Ստեղծել հաշիվ
                </Button>
            </ButtonGroup>
        </div>
    );
};
