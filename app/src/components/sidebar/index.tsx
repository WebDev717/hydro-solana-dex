import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import MuiDrawer from '@mui/material/Drawer';
import {
    List,
    ListSubheader,
    Paper,
    IconButton,
    Link
} from '@mui/material';
import cn from 'classnames';

import Logo from '../../assets/images/logo.png';
import LogoSM from '../../assets/images/logo_sm.png';
import Collapse from '../../assets/images/collapse.png';
import Expand from '../../assets/images/expand.png';
import {
    MenuOpen,
    MenuClose,
    Trading,
    Swap,
    Liquidity,
    Farms,
    Doc,
    List as Menu,
    Share,
    Twitter,
    Telegram,
    Speaker,
    Medium,
    Discord
} from '../icons';
import ListItem from './list-item';
import ListItemCollapsible from './list-item-collapsible';

const useStyles = makeStyles({
    drawer: {
        height: '100%',
        width: '240px',
        '& .MuiDrawer-paper': {
            background: '#171524',
            borderRight: 'none',
            width: '100%',
            height: '100vh',
            position: 'static',
            justifyContent: 'space-between',
            overflow: 'visible'
        },
        '&.collapsed': {
            width: '104px'
        },
        '&.expanded': {
            '& .MuiDrawer-paper': {
                position: 'fixed'
            }
        },
        '@media (max-width:600px)': {
            width: '100%',
            height: '60px',
            overflow: 'hidden'
        }
    },
    drawerHeader: {
        backgroundColor: 'transparent !important',
        lineHeight: 'initial !important',
        padding: '24px 32px !important',
        display: 'flex',
        '& img': {
            width: '100%'
        },
        '&.collapsed': {
            padding: '12px 16px !important',
        },
        '@media (max-width:600px)': {
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px !important',
            height: '60px',
            '& img': {
                width: '150px'
            }
        }
    },
    mobileHandler: {
        padding: '0 !important'
    },
    list: {
        '& *': {
            transition: 'width .3s !important',
            color: 'hsla(0,0%,100%,.5)',
        },
        '& .MuiListItemButton-root': {
            '& .MuiListItemIcon-root': {
                minWidth: '40px'
            },
            '& .MuiListItemText-root': {
                marginTop: '5px',
                marginBottom: '4px',
                '& span': {
                    fontSize: '16px'
                }
            },
            '& > svg': {
                width: '18px',
                height: '18px'
            },
            '&:hover': {
                '& *': {
                    color: '#FFF'
                }
            }
        },
        '&.collapsed': {
            '& .MuiListItemButton-root': {
                flexDirection: 'column',
                '& .MuiListItemIcon-root': {
                    minWidth: 'initial',
                    '& svg': {
                        height: '28px',
                        width: '28px'
                    }
                },
                '& .MuiListItemText-root': {
                    '& span': {
                        fontSize: '14px'
                    }
                },
                '& > svg': {
                    display: 'none'
                }
            }
        }
    },
    links: {
        backgroundColor: 'transparent !important',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        position: 'relative',
        '& .MuiLink-root': {
            color: 'hsla(0,0%,100%,.5)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            border: '1px solid hsla(0,0%,100%,.5)',
            borderRadius: '15px',
            padding: '5px 10px',
            margin: '10px 0',
            width: 'calc(100% - 22px)',
            justifyContent: 'center',
            '& svg': {
                width: '18px',
                height: '18px',
                marginRight: '10px'
            },
            '&:hover': {
                color: '#FFF'
            }
        },
        '&.expanded': {
            padding: '0 16px 8px'
        }
    },
    linkWrapper: {
        backgroundColor: 'transparent !important',
        position: 'relative',
        height: '51px',
        width: '142px',
        '& .MuiLink-root': {
            position: 'absolute'
        },
        '&.collapsed': {
            width: '38.5px',
            overflow: 'hidden',
            '& .MuiLink-root': {
                justifyContent: 'flex-start',
                '& span': {
                    whiteSpace: 'nowrap'
                }
            },
            '&:hover': {
                overflow: 'visible',
                '& .MuiLink-root': {
                    minWidth: '100px'
                }
            }
        }
    },
    handler: {
        padding: '0 !important',
        position: 'absolute !important' as any,
        width: '12px',
        left: 0,
        top: '-42px',
        '& img': {
            width: '100%'
        }
    },
    socialWrapper: {
        backgroundColor: 'transparent !important',
        position: 'relative',
        height: '50px',
        width: '210px',
        '&.collapsed': {
            width: '39px',
            overflow: 'hidden',
            '&:hover': {
                overflow: 'visible',
                '& .MuiPaper-root': {
                    width: 'initial'
                }
            }
        }
    },
    social: {
        backgroundColor: 'transparent !important',
        display: 'flex',
        margin: '10px 0',
        padding: '5px 10px',
        position: 'absolute',
        width: 'calc(100% - 22px)',
        '& .MuiLink-root': {
            border: 'none',
            width: 'initial',
            padding: '0',
            margin: '0',
            '& svg': {
                margin: '0 10px',
            },
            '&:last-of-type': {
                '& svg': {
                    marginRight: 0
                }
            }
        },
        '& > svg': {
            color: 'hsla(0,0%,100%,.5)',
            marginRight: '10px',
            width: '18px',
            height: '18px',
            cursor: 'pointer'
        },
        '&.collapsed': {
            border: '1px solid hsla(0,0%,100%,.5)',
            borderRadius: '15px'
        }
    }
})

const SidebarItems = [
    {
        name: 'Trading',
        icon: <Trading />
    },
    {
        name: 'Swap',
        icon: <Swap />
    },
    {
        name: 'Liquidity',
        icon: <Liquidity />,
        childs: [
            {
                name: 'Add Liquidity'
            },
            {
                name: 'Add C-Liquidity',
                preview: true
            }
        ]
    },
    {
        name: 'Farms',
        icon: <Farms />,
        childs: [
            {
                name: 'LP Farming'
            },
            {
                name: 'Staking'
            }
        ]
    }
]

const Sidebar = () => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        // Windows Resize Handler
        function handleResize() {
            setMobile(window.innerWidth <= 600);
        }

        // Add event listener
        window.addEventListener("resize", handleResize);

        handleResize();

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleDrawer = () => {
        setOpen(!open);
    }

    return (
        <MuiDrawer className={cn(classes.drawer, {'collapsed': !open && !mobile, 'expanded': !open && mobile})} variant="permanent">
            <List
                className={cn(classes.list, {'collapsed': !open && !mobile, 'expanded': !open && mobile})}
                component="nav"
                subheader={
                    <ListSubheader className={cn(classes.drawerHeader, {'collapsed': !open && !mobile, 'expanded': !open && mobile})} component="div">
                        {(open || mobile) && <img src={Logo} alt="Hydraswap" />}
                        {(!open && !mobile) && <img src={LogoSM} alt="Hydraswap" />}
                        {mobile && (
                            <IconButton className={classes.mobileHandler} onClick={handleDrawer}>
                                {open ? <MenuClose /> : <MenuOpen />}
                            </IconButton>
                        )}
                    </ListSubheader>
                }
            >
                {SidebarItems.map((item, index) => {
                    if(item.childs) {
                        return <ListItemCollapsible icon={item.icon} name={item.name} childs={item.childs} isCollapsed={!open} isMobile={mobile} key={index} />
                    } else {
                        return <ListItem icon={item.icon} name={item.name} key={index} />
                    }
                })}
                {mobile && (
                    <>
                        <ListItem icon={<Doc />} name="Test Guide" />
                        <ListItem icon={<Menu />} name="Docs" />
                    </>
                )}
            </List>
            <Paper className={cn(classes.links, {'collapsed': !open && !mobile, 'expanded': !open && mobile})} elevation={0}>
                {!mobile && (
                    <IconButton className={classes.handler} onClick={handleDrawer}>
                        {open ? <img src={Collapse} alt="Menu" /> : <img src={Expand} alt="Menu" />}
                    </IconButton>
                )}
                {!mobile && (
                    <Paper className={cn(classes.linkWrapper, {'collapsed': !open && !mobile})} elevation={0}>
                        <Link href="https://hydraswap.gitbook.io/hydra-beta-testing-guide" underline="none">
                            <Doc /><span>Test Guide</span>
                        </Link>
                    </Paper>
                )}
                {!mobile && (
                    <Paper className={cn(classes.linkWrapper, {'collapsed': !open && !mobile})} elevation={0}>
                        <Link href="https://hydraswap.gitbook.io/hydraswap-gitbook/" underline="none">
                            <Menu /><span>Docs</span>
                        </Link>
                    </Paper>
                )}
                <Paper className={cn(classes.socialWrapper, {'collapsed': !open && !mobile})} elevation={0}>
                    <Paper className={cn(classes.social, {'collapsed': !open && !mobile})} elevation={0}>
                        {(!open && !mobile) && <Share />}
                        <Link href="https://twitter.com/HydraSwap_io" underline="none">
                            <Twitter />
                        </Link>
                        <Link href="https://t.me/hydraswap" underline="none">
                            <Telegram />
                        </Link>
                        <Link href="https://t.me/hydraswap_ANN" underline="none">
                            <Speaker />
                        </Link>
                        <Link href="https://medium.com/@HydraSwap" underline="none">
                            <Medium />
                        </Link>
                        <Link href="https://discord.gg/AA26dw6Hpm" underline="none">
                            <Discord />
                        </Link>
                    </Paper>
                </Paper>
            </Paper>
        </MuiDrawer>
    )
}

export default Sidebar;